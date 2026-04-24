import mongoose, { Schema, Document } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────────
export interface Challenge {
  challengeId: string;
  title: string;
  description: string;
  type: string; // daily | weekly | special
  difficulty: number;
  xpReward: number;
  criteria: any;
  expiresAt: Date;
  status: string;
}

export interface IAIGamificationEngine extends Document {
  gamificationId: string;
  tenantId: string;
  studentId: string;
  type: 'CHALLENGE' | 'DIFFICULTY_ADJUSTMENT' | 'TEAM_BALANCE' | 'REWARD_TIMING' | 'STREAK_INTERVENTION';
  challenges: Challenge[];
  difficultyAdjustment: {
    previousLevel: number;
    newLevel: number;
    reason: string;
    adjustmentType: string;
  };
  teamBalance: {
    teams: Array<{
      teamId: string;
      members: string[];
      strengthScore: number;
    }>;
    balanceScore: number;
    methodology: string;
  };
  rewardTiming: {
    nextRewardAt: Date;
    rewardType: string;
    reason: string;
    motivationLevel: string;
  };
  streakIntervention: {
    streakLength: number;
    riskLevel: string;
    intervention: string;
    motivationalMessage: string;
    suggestedActions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────
const AIGamificationEngineSchema = new Schema<IAIGamificationEngine>(
  {
    gamificationId: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, index: true },
    studentId: { type: String, index: true },
    type: {
      type: String,
      required: true,
      enum: ['CHALLENGE', 'DIFFICULTY_ADJUSTMENT', 'TEAM_BALANCE', 'REWARD_TIMING', 'STREAK_INTERVENTION'],
    },
    challenges: [
      {
        challengeId: { type: String },
        title: { type: String },
        description: { type: String },
        type: { type: String, enum: ['daily', 'weekly', 'special'] },
        difficulty: { type: Number },
        xpReward: { type: Number },
        criteria: { type: Schema.Types.Mixed },
        expiresAt: { type: Date },
        status: { type: String },
      },
    ],
    difficultyAdjustment: {
      previousLevel: { type: Number },
      newLevel: { type: Number },
      reason: { type: String },
      adjustmentType: { type: String },
    },
    teamBalance: {
      teams: [
        {
          teamId: { type: String },
          members: [{ type: String }],
          strengthScore: { type: Number },
        },
      ],
      balanceScore: { type: Number },
      methodology: { type: String },
    },
    rewardTiming: {
      nextRewardAt: { type: Date },
      rewardType: { type: String },
      reason: { type: String },
      motivationLevel: { type: String },
    },
    streakIntervention: {
      streakLength: { type: Number },
      riskLevel: { type: String },
      intervention: { type: String },
      motivationalMessage: { type: String },
      suggestedActions: [{ type: String }],
    },
  },
  { timestamps: true }
);

AIGamificationEngineSchema.index({ tenantId: 1, studentId: 1, type: 1 });

export const AIGamificationEngineModel = mongoose.model<IAIGamificationEngine>(
  'AIGamificationEngine',
  AIGamificationEngineSchema
);

export default AIGamificationEngineModel;
