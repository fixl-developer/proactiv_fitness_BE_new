export class AnalyzeVideoDTO {
    tenantId: string;
    studentId: string;
    exerciseType: string;
    videoUrl: string;
    description: string;
}

export class CompareAnalysesDTO {
    tenantId: string;
    analysisId1: string;
    analysisId2: string;
}

export class VideoAnalysisResponseDTO {
    analysisId: string;
    studentId: string;
    exerciseType: string;
    formScore: number;
    analysis: {
        posture: string;
        alignment: string;
        movement: string;
        issues: string[];
        overallAssessment: string;
        safetyRisk: string;
    };
    injuryRisk: {
        riskLevel: string;
        riskFactors: string[];
        recommendations: string[];
    };
    aiPowered: boolean;
}

export class ComparisonResponseDTO {
    analysisId1: string;
    analysisId2: string;
    improvementAreas: string[];
    regressionAreas: string[];
    overallTrend: string;
    scoreDifference: number;
    detailedComparison: string;
    actionItems: string[];
    aiPowered: boolean;
}

export class StudentHistoryResponseDTO {
    studentId: string;
    records: VideoAnalysisResponseDTO[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
