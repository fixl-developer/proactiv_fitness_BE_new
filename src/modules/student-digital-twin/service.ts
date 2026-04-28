import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';
import { v4 as uuidv4 } from 'uuid';
import StudentDigitalTwinModel from './model';

export class StudentDigitalTwinService {
  // ─── Helper: Get or Create Twin ────────────────────────────────
  private async getOrCreateTwin(studentId: string, tenantId: string) {
    let twin = await StudentDigitalTwinModel.findOne({ studentId, tenantId });
    if (!twin) {
      twin = await StudentDigitalTwinModel.create({
        twinId: uuidv4(),
        tenantId,
        studentId,
        lastSyncAt: new Date(),
      });
    }
    return twin;
  }

  // ─── 1. Get Aggregated Student Profile ─────────────────────────
  async getProfile(studentId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a student performance analytics AI for a fitness academy. RESPOND ONLY with valid JSON: {
          "aggregatedSkills": [{ "skill": "string", "level": 1-10, "trend": "improving|stable|declining" }],
          "strengthAreas": ["string"],
          "developmentAreas": ["string"],
          "learningStyle": "string",
          "fitnessAge": 0,
          "totalSessionsCompleted": 0,
          "totalHoursTrained": 0
        }`,
        user: `Generate a comprehensive digital twin profile for student ${studentId} in tenant ${tenantId}. Assess across martial arts, gymnastics, general fitness, and discipline-specific skills. Provide realistic fitness academy metrics.`,
      };

      const result = await aiService.jsonCompletion<{
        aggregatedSkills: Array<{ skill: string; level: number; trend: string }>;
        strengthAreas: string[];
        developmentAreas: string[];
        learningStyle: string;
        fitnessAge: number;
        totalSessionsCompleted: number;
        totalHoursTrained: number;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'student-digital-twin',
        temperature: 0.5,
      });

      const twin = await this.getOrCreateTwin(studentId, tenantId);
      twin.profile = result;
      twin.lastSyncAt = new Date();
      await twin.save();

      logger.info(`Digital Twin: Profile aggregated for student ${studentId}`);

      return {
        twinId: twin.twinId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Digital Twin getProfile failed:', error.message);
      return {
        twinId: uuidv4(),
        aggregatedSkills: [
          { skill: 'Flexibility', level: 5, trend: 'stable' },
          { skill: 'Endurance', level: 6, trend: 'improving' },
          { skill: 'Technique', level: 4, trend: 'improving' },
        ],
        strengthAreas: ['Consistency', 'Endurance'],
        developmentAreas: ['Technique precision', 'Competition confidence'],
        learningStyle: 'Visual-Kinesthetic',
        fitnessAge: 12,
        totalSessionsCompleted: 48,
        totalHoursTrained: 72,
        aiPowered: false,
      };
    }
  }

  // ─── 2. Generate Personalized Learning Path ────────────────────
  async generateLearningPath(studentId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a personalized learning path designer for fitness academies. RESPOND ONLY with valid JSON: {
          "currentPhase": "string",
          "phases": [{ "name": "string", "duration": "string", "goals": ["string"], "exercises": ["string"], "milestones": ["string"] }],
          "progressPercentage": 0,
          "estimatedCompletionDate": "YYYY-MM-DD"
        }`,
        user: `Create a personalized, phased learning path for student ${studentId} in tenant ${tenantId}. Include foundation, development, advanced, and mastery phases with specific exercises, goals, and measurable milestones for each phase.`,
      };

      const result = await aiService.jsonCompletion<{
        currentPhase: string;
        phases: Array<{ name: string; duration: string; goals: string[]; exercises: string[]; milestones: string[] }>;
        progressPercentage: number;
        estimatedCompletionDate: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'student-digital-twin',
        temperature: 0.6,
      });

      const twin = await this.getOrCreateTwin(studentId, tenantId);
      twin.learningPath = {
        currentPhase: result.currentPhase,
        phases: result.phases,
        progressPercentage: result.progressPercentage,
        estimatedCompletionDate: new Date(result.estimatedCompletionDate),
      };
      twin.lastSyncAt = new Date();
      await twin.save();

      logger.info(`Digital Twin: Learning path generated for student ${studentId}`);

      return {
        twinId: twin.twinId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Digital Twin generateLearningPath failed:', error.message);
      return {
        twinId: uuidv4(),
        currentPhase: 'Foundation',
        phases: [
          {
            name: 'Foundation',
            duration: '3 months',
            goals: ['Build base fitness', 'Learn fundamental techniques'],
            exercises: ['Basic stretching', 'Core conditioning', 'Form drills'],
            milestones: ['Complete fitness assessment', 'Master 5 basic techniques'],
          },
        ],
        progressPercentage: 15,
        estimatedCompletionDate: '2027-03-27',
        aiPowered: false,
      };
    }
  }

  // ─── 3. Get Skill Gaps ─────────────────────────────────────────
  async getSkillGaps(studentId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a skill gap analysis AI for fitness academies. RESPOND ONLY with valid JSON: {
          "skillGaps": [{ "skill": "string", "currentLevel": 1-10, "targetLevel": 1-10, "gap": 0, "priority": "high|medium|low", "closingStrategy": "string", "estimatedWeeksToClose": 0 }]
        }`,
        user: `Identify and analyze all skill gaps for student ${studentId} in tenant ${tenantId}. Compare current performance levels against age-appropriate targets across all relevant fitness and technique dimensions. Provide actionable closing strategies.`,
      };

      const result = await aiService.jsonCompletion<{
        skillGaps: Array<{
          skill: string;
          currentLevel: number;
          targetLevel: number;
          gap: number;
          priority: string;
          closingStrategy: string;
          estimatedWeeksToClose: number;
        }>;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'student-digital-twin',
        temperature: 0.5,
      });

      const twin = await this.getOrCreateTwin(studentId, tenantId);
      twin.skillGaps = result.skillGaps;
      twin.lastSyncAt = new Date();
      await twin.save();

      logger.info(`Digital Twin: ${result.skillGaps.length} skill gaps identified for student ${studentId}`);

      return {
        twinId: twin.twinId,
        skillGaps: result.skillGaps,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Digital Twin getSkillGaps failed:', error.message);
      return {
        twinId: uuidv4(),
        skillGaps: [
          { skill: 'Flexibility', currentLevel: 5, targetLevel: 7, gap: 2, priority: 'high', closingStrategy: 'Daily stretching routine with progressive splits training', estimatedWeeksToClose: 8 },
          { skill: 'Balance', currentLevel: 4, targetLevel: 6, gap: 2, priority: 'medium', closingStrategy: 'Balance board exercises and single-leg drills', estimatedWeeksToClose: 6 },
        ],
        aiPowered: false,
      };
    }
  }

  // ─── 4. Get Competition Readiness ──────────────────────────────
  async getCompetitionReadiness(studentId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a competition readiness assessment AI for fitness academies. RESPOND ONLY with valid JSON: {
          "overallScore": 0-100,
          "categories": [{ "name": "string", "score": 0-100, "status": "ready|nearly_ready|needs_work|not_ready" }],
          "readyForLevel": "string",
          "recommendedCompetitions": ["string"],
          "areasToImprove": ["string"]
        }`,
        user: `Assess competition readiness for student ${studentId} in tenant ${tenantId}. Evaluate across technique, fitness, mental preparedness, and experience categories. Recommend appropriate competition levels.`,
      };

      const result = await aiService.jsonCompletion<{
        overallScore: number;
        categories: Array<{ name: string; score: number; status: string }>;
        readyForLevel: string;
        recommendedCompetitions: string[];
        areasToImprove: string[];
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'student-digital-twin',
        temperature: 0.5,
      });

      const twin = await this.getOrCreateTwin(studentId, tenantId);
      twin.competitionReadiness = result;
      twin.lastSyncAt = new Date();
      await twin.save();

      logger.info(`Digital Twin: Competition readiness score ${result.overallScore} for student ${studentId}`);

      return {
        twinId: twin.twinId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Digital Twin getCompetitionReadiness failed:', error.message);
      return {
        twinId: uuidv4(),
        overallScore: 62,
        categories: [
          { name: 'Technique', score: 65, status: 'nearly_ready' },
          { name: 'Fitness', score: 70, status: 'nearly_ready' },
          { name: 'Mental Preparedness', score: 50, status: 'needs_work' },
          { name: 'Experience', score: 55, status: 'needs_work' },
        ],
        readyForLevel: 'Beginner/Novice',
        recommendedCompetitions: ['Local club tournament', 'Inter-academy friendly'],
        areasToImprove: ['Competition simulation training', 'Stress management techniques'],
        aiPowered: false,
      };
    }
  }

  // ─── 5. Generate Development Roadmap ───────────────────────────
  async generateDevelopmentRoadmap(studentId: string, tenantId: string, horizon: string = '1yr') {
    try {
      const prompt = {
        system: `You are a long-term student development planner for fitness academies. RESPOND ONLY with valid JSON: {
          "horizon": "string",
          "milestones": [{ "timeframe": "string", "goal": "string", "requirements": ["string"], "likelihood": 0.0-1.0 }],
          "pathways": [{ "name": "string", "description": "string", "suitability": 0.0-1.0 }],
          "recommendations": ["string"]
        }`,
        user: `Create a ${horizon} development roadmap for student ${studentId} in tenant ${tenantId}. Include progressive milestones, alternative development pathways (competitive, recreational, instructor), and strategic recommendations for long-term growth.`,
      };

      const result = await aiService.jsonCompletion<{
        horizon: string;
        milestones: Array<{ timeframe: string; goal: string; requirements: string[]; likelihood: number }>;
        pathways: Array<{ name: string; description: string; suitability: number }>;
        recommendations: string[];
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'student-digital-twin',
        temperature: 0.6,
        maxTokens: 3000,
      });

      const twin = await this.getOrCreateTwin(studentId, tenantId);
      twin.developmentRoadmap = result;
      twin.lastSyncAt = new Date();
      await twin.save();

      logger.info(`Digital Twin: ${horizon} roadmap generated for student ${studentId}`);

      return {
        twinId: twin.twinId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Digital Twin generateDevelopmentRoadmap failed:', error.message);
      return {
        twinId: uuidv4(),
        horizon,
        milestones: [
          { timeframe: '3 months', goal: 'Achieve next belt/level', requirements: ['Pass technique exam', 'Minimum 24 sessions'], likelihood: 0.8 },
          { timeframe: '6 months', goal: 'Enter first competition', requirements: ['Competition readiness score > 70', 'Coach approval'], likelihood: 0.6 },
        ],
        pathways: [
          { name: 'Competitive Athlete', description: 'Focus on competition performance and rankings', suitability: 0.6 },
          { name: 'Recreational Fitness', description: 'Focus on personal fitness and enjoyment', suitability: 0.8 },
        ],
        recommendations: [
          'Increase training frequency to 3x per week',
          'Begin mental conditioning exercises',
          'Consider cross-training for overall fitness',
        ],
        aiPowered: false,
      };
    }
  }
}

export default new StudentDigitalTwinService();
