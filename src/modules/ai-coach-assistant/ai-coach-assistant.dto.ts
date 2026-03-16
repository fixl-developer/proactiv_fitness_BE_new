export class AnalyzeFormDTO {
    tenantId: string;
    studentId: string;
    videoUrl: string;
    exerciseType: string;
}

export class FormCorrectionResponseDTO {
    assistantId: string;
    formAnalysis: {
        posture: string;
        alignment: string;
        movement: string;
        issues: string[];
    };
    corrections: Array<{
        issue: string;
        correction: string;
        priority: string;
    }>;
}
