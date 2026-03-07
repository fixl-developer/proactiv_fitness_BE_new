import mongoose, { Schema, Document } from 'mongoose';
import { IFormAnalysis, IWorkoutSuggestion, IVoiceCommand, IProgressPrediction, IInjuryAlert, IAIFeedback, IVideoAnnotation, IAICoachSettings } from './ai-coach.interface';

// Form Analysis Model
const FormAnalysisSchema = new Schema<IFormAnalysis & Document>({
    studentId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    exerciseType: { type: String, required: true },
    videoUrl: String,
    timestamp: { type: Date, default: Date.now },
    analysis: {
        posture: {
            score: { type: Number, min: 0, max: 100 },
            issues: [String],
            recommendations: [String]
        },
        technique: {
            score: { type: Number, min: 0, max: 100 },
            strengths: [String],
            improvements: [String]
        },
        safety: {
            riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
            concerns: [String],
            preventionTips: [String]
        }
    },
    aiModel: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1 }
}, { timestamps: true });

FormAnalysisSchema.index({ studentId: 1, timestamp: -1 });
FormAnalysisSchema.index({ sessionId: 1 });

// Workout Suggestion Model
const WorkoutSuggestionSchema = new Schema<IWorkoutSuggestion & Document>({
    studentId: { type: String, required: true, index: true },
    programId: { type: String, required: true },
    suggestions: {
        exercises: [{
            name: String,
            duration: Number,
            sets: Number,
            reps: Number,
            difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
            focusAreas: [String]
        }],
        reasoning: String,
        adaptations: [String]
    },
    basedOn: {
        skillLevel: String,
        recentPerformance: [Schema.Types.Mixed],
        goals: [String],
        injuries: [String]
    },
    generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

WorkoutSuggestionSchema.index({ studentId: 1, generatedAt: -1 });

// Voice Command Model
const VoiceCommandSchema = new Schema<IVoiceCommand & Document>({
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, index: true },
    coachId: { type: String, required: true },
    sessionId: { type: String, required: true },
    audioUrl: String,
    transcript: { type: String, required: true },
    intent: String,
    entities: Schema.Types.Mixed,
    response: String,
    processedAt: { type: Date, default: Date.now }
}, { timestamps: true });

VoiceCommandSchema.index({ sessionId: 1, processedAt: -1 });

// Progress Prediction Model
const ProgressPredictionSchema = new Schema<IProgressPrediction & Document>({
    studentId: { type: String, required: true, index: true },
    skillId: { type: String, required: true },
    currentLevel: { type: Number, required: true },
    predictions: {
        nextMilestone: {
            skill: String,
            estimatedDate: Date,
            confidence: Number
        },
        projectedProgress: [{
            date: Date,
            expectedLevel: Number,
            factors: [String]
        }],
        recommendations: [String]
    },
    modelVersion: String,
    generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ProgressPredictionSchema.index({ studentId: 1, skillId: 1, generatedAt: -1 });

// Injury Alert Model
const InjuryAlertSchema = new Schema<IInjuryAlert & Document>({
    studentId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    alertType: { type: String, enum: ['posture', 'overexertion', 'fatigue', 'form'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    description: { type: String, required: true },
    detectedAt: { type: Date, default: Date.now },
    videoTimestamp: Number,
    recommendations: [String],
    notified: { type: Boolean, default: false }
}, { timestamps: true });

InjuryAlertSchema.index({ studentId: 1, detectedAt: -1 });
InjuryAlertSchema.index({ severity: 1, notified: 1 });

// AI Feedback Model
const AIFeedbackSchema = new Schema<IAIFeedback & Document>({
    studentId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    exerciseId: { type: String, required: true },
    feedback: {
        overall: String,
        specific: [String],
        encouragement: String,
        nextSteps: [String]
    },
    deliveryMethod: { type: String, enum: ['text', 'voice', 'visual'] },
    sentiment: { type: String, enum: ['positive', 'constructive', 'corrective'] },
    generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

AIFeedbackSchema.index({ studentId: 1, sessionId: 1 });

// Video Annotation Model
const VideoAnnotationSchema = new Schema<IVideoAnnotation & Document>({
    videoId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, index: true },
    annotations: [{
        timestamp: Number,
        type: { type: String, enum: ['form', 'technique', 'safety', 'achievement'] },
        marker: {
            x: Number,
            y: Number,
            label: String,
            color: String
        },
        note: String
    }],
    aiGenerated: { type: Boolean, default: true },
    reviewedBy: String,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

VideoAnnotationSchema.index({ studentId: 1, createdAt: -1 });

// AI Coach Settings Model
const AICoachSettingsSchema = new Schema<IAICoachSettings & Document>({
    tenantId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    features: {
        formCorrection: { type: Boolean, default: true },
        voiceCommands: { type: Boolean, default: true },
        progressPrediction: { type: Boolean, default: true },
        injuryPrevention: { type: Boolean, default: true },
        autoFeedback: { type: Boolean, default: true },
        videoAnalysis: { type: Boolean, default: true }
    },
    aiProvider: { type: String, enum: ['openai', 'anthropic', 'custom'], default: 'openai' },
    modelVersion: { type: String, default: 'gpt-4' },
    confidenceThreshold: { type: Number, default: 0.7, min: 0, max: 1 },
    language: { type: String, default: 'en' }
}, { timestamps: true });

export const FormAnalysis = mongoose.model<IFormAnalysis & Document>('FormAnalysis', FormAnalysisSchema);
export const WorkoutSuggestion = mongoose.model<IWorkoutSuggestion & Document>('WorkoutSuggestion', WorkoutSuggestionSchema);
export const VoiceCommand = mongoose.model<IVoiceCommand & Document>('VoiceCommand', VoiceCommandSchema);
export const ProgressPrediction = mongoose.model<IProgressPrediction & Document>('ProgressPrediction', ProgressPredictionSchema);
export const InjuryAlert = mongoose.model<IInjuryAlert & Document>('InjuryAlert', InjuryAlertSchema);
export const AIFeedback = mongoose.model<IAIFeedback & Document>('AIFeedback', AIFeedbackSchema);
export const VideoAnnotation = mongoose.model<IVideoAnnotation & Document>('VideoAnnotation', VideoAnnotationSchema);
export const AICoachSettings = mongoose.model<IAICoachSettings & Document>('AICoachSettings', AICoachSettingsSchema);
