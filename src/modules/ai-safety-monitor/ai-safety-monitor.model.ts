import { Schema, model, Document } from 'mongoose';

export interface IAISafetyMonitorDocument extends Document {
    monitorId: string;
    tenantId: string;
    locationId: string;
    type: string;
    safetyScore: {
        overall: number;
        categories: Array<{
            name: string;
            score: number;
            issues: string[];
        }>;
        trend: string;
    };
    incidentPrediction: {
        riskLevel: string;
        predictedIncidents: Array<{
            type: string;
            probability: number;
            mitigationSteps: string[];
        }>;
    };
    certificationAlerts: Array<{
        coachId: string;
        coachName: string;
        certificationName: string;
        expiryDate: Date;
        daysUntilExpiry: number;
        status: string;
    }>;
    emergencyGuide: {
        scenario: string;
        steps: string[];
        contactList: Array<{
            role: string;
            action: string;
        }>;
        firstAidInstructions: string;
    };
    complianceAudit: {
        overallCompliance: number;
        areas: Array<{
            area: string;
            status: string;
            findings: string[];
            recommendations: string[];
        }>;
        criticalIssues: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const aiSafetyMonitorSchema = new Schema<IAISafetyMonitorDocument>(
    {
        monitorId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        locationId: { type: String },
        type: {
            type: String,
            enum: ['SAFETY_SCORE', 'INCIDENT_PREDICTION', 'CERTIFICATION_ALERT', 'EMERGENCY_GUIDE', 'COMPLIANCE_AUDIT'],
            required: true,
        },
        safetyScore: {
            overall: { type: Number },
            categories: [
                {
                    name: { type: String },
                    score: { type: Number },
                    issues: [{ type: String }],
                },
            ],
            trend: { type: String },
        },
        incidentPrediction: {
            riskLevel: { type: String },
            predictedIncidents: [
                {
                    type: { type: String },
                    probability: { type: Number },
                    mitigationSteps: [{ type: String }],
                },
            ],
        },
        certificationAlerts: [
            {
                coachId: { type: String },
                coachName: { type: String },
                certificationName: { type: String },
                expiryDate: { type: Date },
                daysUntilExpiry: { type: Number },
                status: { type: String },
            },
        ],
        emergencyGuide: {
            scenario: { type: String },
            steps: [{ type: String }],
            contactList: [
                {
                    role: { type: String },
                    action: { type: String },
                },
            ],
            firstAidInstructions: { type: String },
        },
        complianceAudit: {
            overallCompliance: { type: Number },
            areas: [
                {
                    area: { type: String },
                    status: { type: String },
                    findings: [{ type: String }],
                    recommendations: [{ type: String }],
                },
            ],
            criticalIssues: [{ type: String }],
        },
    },
    { timestamps: true }
);

export const AISafetyMonitorModel = model<IAISafetyMonitorDocument>('AISafetyMonitor', aiSafetyMonitorSchema);
