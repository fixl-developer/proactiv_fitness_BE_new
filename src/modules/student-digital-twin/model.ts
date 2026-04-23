import mongoose, { Schema, Document, Mixed } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────────
export interface AggregatedSkill {
  skill: string;
  level: number;
  trend: string;
}

export interface LearningPhase {
  name: string;
  duration: string;
  goals: string[];
  exercises: string[];
  milestones: string[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: string;
  closingStrategy: string;
  estimatedWeeksToClose: number;
}

export interface CompetitionCategory {
  name: string;
  score: number;
  status: string;
}

export interface Milestone {
  timeframe: string;
  goal: string;
  requirements: string[];
  likelihood: number;
}

export interface Pathway {
  name: string;
  description: string;
  suitability: number;
}

export interface IStudentDigitalTwin extends Document {
  twinId: string;
  tenantId: string;
  studentId: string;
  profile: {
    aggregatedSkills: AggregatedSkill[];
    strengthAreas: string[];
    developmentAreas: string[];
    learningStyle: string;
    fitnessAge: number;
    totalSessionsCompleted: number;
    totalHoursTrained: number;
  };
  learningPath: {
    currentPhase: string;
    phases: LearningPhase[];
    progressPercentage: number;
    estimatedCompletionDate: Date;
  };
  skillGaps: SkillGap[];
  competitionReadiness: {
    overallScore: number;
    categories: CompetitionCategory[];
    readyForLevel: string;
    recommendedCompetitions: string[];
    areasToImprove: string[];
  };
  developmentRoadmap: {
    horizon: string;
    milestones: Milestone[];
    pathways: Pathway[];
    recommendations: string[];
  };
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────
const StudentDigitalTwinSchema = new Schema<IStudentDigitalTwin>(
  {
    twinId: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    profile: {
      aggregatedSkills: [
        {
          skill: { type: String },
          level: { type: Number },
          trend: { type: String },
        },
      ],
      strengthAreas: [{ type: String }],
      developmentAreas: [{ type: String }],
      learningStyle: { type: String },
      fitnessAge: { type: Number },
      totalSessionsCompleted: { type: Number },
      totalHoursTrained: { type: Number },
    },
    learningPath: {
      currentPhase: { type: String },
      phases: [
        {
          name: { type: String },
          duration: { type: String },
          goals: [{ type: String }],
          exercises: [{ type: String }],
          milestones: [{ type: String }],
        },
      ],
      progressPercentage: { type: Number },
      estimatedCompletionDate: { type: Date },
    },
    skillGaps: [
      {
        skill: { type: String },
        currentLevel: { type: Number },
        targetLevel: { type: Number },
        gap: { type: Number },
        priority: { type: String },
        closingStrategy: { type: String },
        estimatedWeeksToClose: { type: Number },
      },
    ],
    competitionReadiness: {
      overallScore: { type: Number },
      categories: [
        {
          name: { type: String },
          score: { type: Number },
          status: { type: String },
        },
      ],
      readyForLevel: { type: String },
      recommendedCompetitions: [{ type: String }],
      areasToImprove: [{ type: String }],
    },
    developmentRoadmap: {
      horizon: { type: String },
      milestones: [
        {
          timeframe: { type: String },
          goal: { type: String },
          requirements: [{ type: String }],
          likelihood: { type: Number },
        },
      ],
      pathways: [
        {
          name: { type: String },
          description: { type: String },
          suitability: { type: Number },
        },
      ],
      recommendations: [{ type: String }],
    },
    lastSyncAt: { type: Date },
  },
  { timestamps: true }
);

StudentDigitalTwinSchema.index({ tenantId: 1, studentId: 1 }, { unique: true });

export const StudentDigitalTwinModel = mongoose.model<IStudentDigitalTwin>(
  'StudentDigitalTwin',
  StudentDigitalTwinSchema
);

export default StudentDigitalTwinModel;
