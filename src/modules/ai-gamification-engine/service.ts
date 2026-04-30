import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';
import { v4 as uuidv4 } from 'uuid';
import AIGamificationEngineModel from './model';

export class AIGamificationEngineService {
  // ─── 1. Generate Personalized Challenges ───────────────────────
  async generateChallenges(studentId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a gamification expert for fitness academies. Create personalized, motivating challenges. RESPOND ONLY with valid JSON: {
          "challenges": [{
            "challengeId": "string",
            "title": "string",
            "description": "string",
            "type": "daily|weekly|special",
            "difficulty": 1-10,
            "xpReward": 0,
            "criteria": { "metric": "string", "target": 0, "unit": "string" },
            "expiresAt": "ISO date string",
            "status": "active"
          }]
        }`,
        user: `Generate a set of personalized fitness challenges for student ${studentId} in tenant ${tenantId}. Include 2 daily challenges, 2 weekly challenges, and 1 special challenge. Make them progressively difficult and rewarding. Use realistic XP values (50-500). Set expiration dates appropriately.`,
      };

      const result = await aiService.jsonCompletion<{
        challenges: Array<{
          challengeId: string;
          title: string;
          description: string;
          type: string;
          difficulty: number;
          xpReward: number;
          criteria: any;
          expiresAt: string;
          status: string;
        }>;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-gamification-engine',
        temperature: 0.7,
      });

      const challenges = result.challenges.map((c) => ({
        ...c,
        challengeId: c.challengeId || uuidv4(),
        expiresAt: new Date(c.expiresAt),
      }));

      const record = await AIGamificationEngineModel.create({
        gamificationId: uuidv4(),
        tenantId,
        studentId,
        type: 'CHALLENGE',
        challenges,
      });

      logger.info(`Gamification: ${challenges.length} challenges generated for student ${studentId}`);

      return {
        gamificationId: record.gamificationId,
        challenges,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Gamification generateChallenges failed:', error.message);
      const now = new Date();
      return {
        gamificationId: uuidv4(),
        challenges: [
          {
            challengeId: uuidv4(),
            title: 'Morning Warrior',
            description: 'Complete a 15-minute morning workout',
            type: 'daily',
            difficulty: 3,
            xpReward: 75,
            criteria: { metric: 'workout_duration', target: 15, unit: 'minutes' },
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            status: 'active',
          },
          {
            challengeId: uuidv4(),
            title: 'Consistency King',
            description: 'Attend 4 sessions this week',
            type: 'weekly',
            difficulty: 5,
            xpReward: 200,
            criteria: { metric: 'sessions_attended', target: 4, unit: 'sessions' },
            expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: 'active',
          },
        ],
        aiPowered: false,
      };
    }
  }

  // ─── 2. Adjust Difficulty Based on Performance ─────────────────
  async adjustDifficulty(data: {
    tenantId: string;
    studentId: string;
    currentLevel: number;
    recentPerformance: {
      completionRate: number;
      averageScore: number;
      streak: number;
    };
  }) {
    try {
      const prompt = {
        system: `You are an adaptive difficulty engine for fitness gamification. RESPOND ONLY with valid JSON: {
          "previousLevel": 0,
          "newLevel": 0,
          "reason": "string",
          "adjustmentType": "increase|decrease|maintain"
        }`,
        user: `Analyze and adjust difficulty for student ${data.studentId}.
Current difficulty level: ${data.currentLevel}
Recent performance:
- Completion rate: ${data.recentPerformance.completionRate}%
- Average score: ${data.recentPerformance.averageScore}/100
- Current streak: ${data.recentPerformance.streak} days
Determine optimal difficulty adjustment to maintain flow state.`,
      };

      const result = await aiService.jsonCompletion<{
        previousLevel: number;
        newLevel: number;
        reason: string;
        adjustmentType: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-gamification-engine',
        temperature: 0.4,
      });

      const record = await AIGamificationEngineModel.create({
        gamificationId: uuidv4(),
        tenantId: data.tenantId,
        studentId: data.studentId,
        type: 'DIFFICULTY_ADJUSTMENT',
        difficultyAdjustment: result,
      });

      logger.info(`Gamification: Difficulty adjusted ${result.adjustmentType} for student ${data.studentId}`);

      return {
        gamificationId: record.gamificationId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Gamification adjustDifficulty failed:', error.message);
      const adjustment = data.recentPerformance.completionRate > 80 ? 1 : data.recentPerformance.completionRate < 40 ? -1 : 0;
      return {
        gamificationId: uuidv4(),
        previousLevel: data.currentLevel,
        newLevel: Math.max(1, Math.min(10, data.currentLevel + adjustment)),
        reason: 'Fallback: Adjusted based on completion rate threshold',
        adjustmentType: adjustment > 0 ? 'increase' : adjustment < 0 ? 'decrease' : 'maintain',
        aiPowered: false,
      };
    }
  }

  // ─── 3. Balance Teams ──────────────────────────────────────────
  async balanceTeams(data: {
    tenantId: string;
    participants: Array<{ studentId: string; skillLevel: number; strengths: string[] }>;
    teamCount: number;
    activityType?: string;
  }) {
    try {
      const prompt = {
        system: `You are a team balancing AI for fitness activities. RESPOND ONLY with valid JSON: {
          "teams": [{ "teamId": "string", "members": ["studentId"], "strengthScore": 0 }],
          "balanceScore": 0-100,
          "methodology": "string"
        }`,
        user: `Create ${data.teamCount} balanced teams from these participants for ${data.activityType || 'general fitness activity'}:
${JSON.stringify(data.participants, null, 2)}
Ensure teams are balanced by skill level and complementary strengths.`,
      };

      const result = await aiService.jsonCompletion<{
        teams: Array<{ teamId: string; members: string[]; strengthScore: number }>;
        balanceScore: number;
        methodology: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-gamification-engine',
        temperature: 0.5,
      });

      const record = await AIGamificationEngineModel.create({
        gamificationId: uuidv4(),
        tenantId: data.tenantId,
        type: 'TEAM_BALANCE',
        teamBalance: result,
      });

      logger.info(`Gamification: ${result.teams.length} balanced teams created (score: ${result.balanceScore})`);

      return {
        gamificationId: record.gamificationId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Gamification balanceTeams failed:', error.message);
      // Simple round-robin fallback
      const teams: Array<{ teamId: string; members: string[]; strengthScore: number }> = [];
      for (let i = 0; i < data.teamCount; i++) {
        teams.push({ teamId: uuidv4(), members: [], strengthScore: 0 });
      }
      const sorted = [...data.participants].sort((a, b) => b.skillLevel - a.skillLevel);
      sorted.forEach((p, idx) => {
        const teamIdx = idx % data.teamCount;
        teams[teamIdx].members.push(p.studentId);
        teams[teamIdx].strengthScore += p.skillLevel;
      });
      teams.forEach((t) => {
        t.strengthScore = t.members.length > 0 ? t.strengthScore / t.members.length : 0;
      });
      return {
        gamificationId: uuidv4(),
        teams,
        balanceScore: 60,
        methodology: 'Fallback: Round-robin skill-sorted distribution',
        aiPowered: false,
      };
    }
  }

  // ─── 4. Get Optimal Reward Timing ──────────────────────────────
  async getRewardTiming(studentId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a behavioral psychology AI optimizing reward timing in fitness gamification. RESPOND ONLY with valid JSON: {
          "nextRewardAt": "ISO date string",
          "rewardType": "string",
          "reason": "string",
          "motivationLevel": "high|medium|low|critical"
        }`,
        user: `Determine the optimal next reward timing for student ${studentId} in tenant ${tenantId}. Consider variable ratio reinforcement schedules, current engagement patterns, and motivation psychology to maximize long-term engagement.`,
      };

      const result = await aiService.jsonCompletion<{
        nextRewardAt: string;
        rewardType: string;
        reason: string;
        motivationLevel: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-gamification-engine',
        temperature: 0.5,
      });

      const record = await AIGamificationEngineModel.create({
        gamificationId: uuidv4(),
        tenantId,
        studentId,
        type: 'REWARD_TIMING',
        rewardTiming: {
          nextRewardAt: new Date(result.nextRewardAt),
          rewardType: result.rewardType,
          reason: result.reason,
          motivationLevel: result.motivationLevel,
        },
      });

      logger.info(`Gamification: Reward timing set for student ${studentId} - ${result.rewardType}`);

      return {
        gamificationId: record.gamificationId,
        nextRewardAt: result.nextRewardAt,
        rewardType: result.rewardType,
        reason: result.reason,
        motivationLevel: result.motivationLevel,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Gamification getRewardTiming failed:', error.message);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        gamificationId: uuidv4(),
        nextRewardAt: tomorrow.toISOString(),
        rewardType: 'bonus_xp',
        reason: 'Fallback: Default daily reward schedule',
        motivationLevel: 'medium',
        aiPowered: false,
      };
    }
  }

  // ─── 5. Get Streak Breaking Risk ───────────────────────────────
  async getStreakRisk(studentId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a streak retention AI for fitness gamification. RESPOND ONLY with valid JSON: {
          "streakLength": 0,
          "riskLevel": "low|medium|high|critical",
          "intervention": "string",
          "motivationalMessage": "string",
          "suggestedActions": ["string"]
        }`,
        user: `Analyze the streak breaking risk for student ${studentId} in tenant ${tenantId}. Evaluate patterns that indicate potential disengagement, consider day of week, historical drop-off points, and external factors. Provide an intervention strategy and motivational message.`,
      };

      const result = await aiService.jsonCompletion<{
        streakLength: number;
        riskLevel: string;
        intervention: string;
        motivationalMessage: string;
        suggestedActions: string[];
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-gamification-engine',
        temperature: 0.5,
      });

      const record = await AIGamificationEngineModel.create({
        gamificationId: uuidv4(),
        tenantId,
        studentId,
        type: 'STREAK_INTERVENTION',
        streakIntervention: result,
      });

      logger.info(`Gamification: Streak risk ${result.riskLevel} for student ${studentId}`);

      return {
        gamificationId: record.gamificationId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Gamification getStreakRisk failed:', error.message);
      return {
        gamificationId: uuidv4(),
        streakLength: 0,
        riskLevel: 'medium',
        intervention: 'Send a motivational push notification',
        motivationalMessage: 'Your streak is impressive! Keep going - every session counts toward your goals!',
        suggestedActions: [
          'Send reminder notification 2 hours before usual training time',
          'Offer a bonus XP incentive for maintaining streak',
          'Suggest a shorter workout option to maintain streak',
        ],
        aiPowered: false,
      };
    }
  }
}

export default new AIGamificationEngineService();
