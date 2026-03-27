export class PredictAttendanceDTO {
    tenantId: string;
    classId: string;
    studentIds: string[];
    historicalData: Record<string, any>;
}

export class OptimizeScheduleDTO {
    tenantId: string;
    locationId: string;
    currentSchedule: Record<string, any>;
    constraints?: Record<string, any>;
}

export class MatchCoachDTO {
    tenantId: string;
    studentId: string;
    requirements: Record<string, any>;
    availableCoaches: Array<Record<string, any>>;
}

export class AutoFillWaitlistDTO {
    tenantId: string;
    classId: string;
    waitlistedStudents: Array<Record<string, any>>;
    currentEnrolled: number;
    maxCapacity: number;
}

export class AttendancePredictionResponseDTO {
    predictionId: string;
    classId: string;
    predictions: Array<{
        studentId: string;
        noShowProbability: number;
        confidence: number;
        factors: string[];
    }>;
    classNoShowRate: number;
    recommendedOverbooking: number;
    insights: string;
    aiPowered: boolean;
}

export class ScheduleOptimizationResponseDTO {
    predictionId: string;
    locationId: string;
    suggestedSlots: Array<{
        dayOfWeek: string;
        timeSlot: string;
        expectedDemand: number;
        score: number;
    }>;
    reasoning: string;
    expectedImprovementPercent: number;
    aiPowered: boolean;
}

export class PeakHoursResponseDTO {
    predictionId: string;
    locationId: string;
    peakHours: Array<{
        hour: number;
        utilization: number;
    }>;
    recommendations: string[];
    busiestDay: string;
    quietestDay: string;
    aiPowered: boolean;
}

export class CoachMatchResponseDTO {
    predictionId: string;
    studentId: string;
    bestMatch: {
        coachId: string;
        matchScore: number;
        matchReasons: string[];
    };
    alternativeMatches: Array<{
        coachId: string;
        matchScore: number;
        matchReasons: string[];
    }>;
    reasoning: string;
    aiPowered: boolean;
}

export class WaitlistFillResponseDTO {
    predictionId: string;
    classId: string;
    promotions: Array<{
        studentId: string;
        reason: string;
        confidence: number;
    }>;
    expectedNoShows: number;
    availableSpots: number;
    reasoning: string;
    riskAssessment: string;
    aiPowered: boolean;
}
