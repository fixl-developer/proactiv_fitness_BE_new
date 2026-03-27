export class SafetyScoreRequestDTO {
    locationId: string;
    tenantId: string;
}

export class EmergencyGuideRequestDTO {
    tenantId: string;
    locationId?: string;
    scenario: string;
    facilityType?: string;
}

export class ComplianceAuditRequestDTO {
    locationId: string;
    tenantId: string;
}

export class SafetyScoreResponseDTO {
    monitorId: string;
    locationId: string;
    safetyScore: {
        overall: number;
        categories: Array<{
            name: string;
            score: number;
            issues: string[];
        }>;
        trend: string;
    };
    recommendations: string[];
    urgentActions: string[];
    assessedAt: Date;
    aiPowered: boolean;
}

export class IncidentPredictionResponseDTO {
    monitorId: string;
    riskLevel: string;
    predictedIncidents: Array<{
        type: string;
        probability: number;
        mitigationSteps: string[];
        timeframe: string;
        severity: string;
    }>;
    overallRiskTrend: string;
    preventiveActions: string[];
    predictedAt: Date;
    aiPowered: boolean;
}

export class CertificationAlertResponseDTO {
    monitorId: string;
    alerts: Array<{
        coachId: string;
        coachName: string;
        certificationName: string;
        expiryDate: string;
        daysUntilExpiry: number;
        status: string;
        renewalSteps: string[];
    }>;
    summary: {
        totalCoaches: number;
        expiringSoon: number;
        expired: number;
        critical: number;
    };
    prioritizedActions: string[];
    checkedAt: Date;
    aiPowered: boolean;
}

export class EmergencyGuideResponseDTO {
    monitorId: string;
    scenario: string;
    steps: string[];
    contactList: Array<{
        role: string;
        action: string;
    }>;
    firstAidInstructions: string;
    evacuationProcedure: string;
    equipmentNeeded: string[];
    postIncidentSteps: string[];
    legalConsiderations: string[];
    generatedAt: Date;
    aiPowered: boolean;
}

export class ComplianceAuditResponseDTO {
    monitorId: string;
    locationId: string;
    overallCompliance: number;
    areas: Array<{
        area: string;
        status: string;
        findings: string[];
        recommendations: string[];
    }>;
    criticalIssues: string[];
    nextAuditDate: string;
    complianceGrade: string;
    regulatoryNotes: string[];
    auditedAt: Date;
    aiPowered: boolean;
}
