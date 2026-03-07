// AI Coach Assistant Interfaces
export interface IFormAnalysis {
    studentId: string;
    sessionId: string;
    exerciseType: string;
    videoUrl?: string;
    timestamp: Date;
    analysis: {
        posture: {
            score: number; // 0-100
            issues: string[];
            recommendations: string[];
        };
        technique: {
            score: number;
            strengths: string[];
            improvements: string[];
        };
        safety: {
            riskLevel: 'low' | 'medium' | 'high';
            concerns: string[];
            preventionTips: string[];
        };
    };
    aiModel: string;
    confidence: number;
}

export interface IWorkoutSuggestion {
    studentId: string;
    programId: string;
    suggestions: {
        exercises: Array<{
            name: string;
            duration: number;
            sets?: number;
            reps?: number;
            difficulty: 'beginner' | 'intermediate' | 'advanced';
            focusAreas: string[];
        }>;
        reasoning: string;
        adaptations: string[];
    };
    basedOn: {
        skillLevel: string;
        recentPerformance: any[];
        goals: string[];
        injuries?: string[];
    };
    generatedAt: Date;
}

export interface IVoiceCommand {
    id: string;
    studentId: string;
    coachId: string;
    sessionId: string;
    audioUrl: string;
    transcript: string;
    intent: string;
    entities: Record<string, any>;
    response: string;
    processedAt: Date;
}

export interface IProgressPrediction {
    studentId: string;
    skillId: string;
    currentLevel: number;
    predictions: {
        nextMilestone: {
            skill: string;
            estimatedDate: Date;
            confidence: number;
        };
        projectedProgress: Array<{
            date: Date;
            expectedLevel: number;
            factors: string[];
        }>;
        recommendations: string[];
    };
    modelVersion: string;
    generatedAt: Date;
}

export interface IInjuryAlert {
    studentId: string;
    sessionId: string;
    alertType: 'posture' | 'overexertion' | 'fatigue' | 'form';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    videoTimestamp?: number;
    recommendations: string[];
    notified: boolean;
}

export interface IAIFeedback {
    studentId: string;
    sessionId: string;
    exerciseId: string;
    feedback: {
        overall: string;
        specific: string[];
        encouragement: string;
        nextSteps: string[];
    };
    deliveryMethod: 'text' | 'voice' | 'visual';
    sentiment: 'positive' | 'constructive' | 'corrective';
    generatedAt: Date;
}

export interface IVideoAnnotation {
    videoId: string;
    studentId: string;
    annotations: Array<{
        timestamp: number;
        type: 'form' | 'technique' | 'safety' | 'achievement';
        marker: {
            x: number;
            y: number;
            label: string;
            color: string;
        };
        note: string;
    }>;
    aiGenerated: boolean;
    reviewedBy?: string;
    createdAt: Date;
}

export interface IAICoachSettings {
    tenantId: string;
    enabled: boolean;
    features: {
        formCorrection: boolean;
        voiceCommands: boolean;
        progressPrediction: boolean;
        injuryPrevention: boolean;
        autoFeedback: boolean;
        videoAnalysis: boolean;
    };
    aiProvider: 'openai' | 'anthropic' | 'custom';
    modelVersion: string;
    confidenceThreshold: number;
    language: string;
}
