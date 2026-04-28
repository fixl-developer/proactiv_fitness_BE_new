import { AISafetyMonitorModel } from './ai-safety-monitor.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';

export class AISafetyMonitorService {
    // ─── Get Safety Score ────────────────────────────────────────
    async getSafetyScore(locationId: string, tenantId: string) {
        try {
            const recentReports = await AISafetyMonitorModel.find({
                tenantId,
                locationId,
                type: { $in: ['SAFETY_SCORE', 'INCIDENT_PREDICTION', 'COMPLIANCE_AUDIT'] },
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = {
                system: `You are an expert fitness facility safety analyst. RESPOND ONLY with valid JSON: { "overall": number (0-100), "categories": [{ "name": "string", "score": number (0-100), "issues": ["string"] }], "trend": "improving|stable|declining", "recommendations": ["string"], "urgentActions": ["string"] }`,
                user: `Calculate a comprehensive safety score for a fitness facility.
Location ID: ${locationId}
Tenant ID: ${tenantId}
Recent Safety History: ${recentReports.length > 0 ? JSON.stringify(recentReports.map(r => ({ type: r.type, safetyScore: r.safetyScore, date: r.createdAt }))) : 'No recent reports'}
Evaluate categories: Equipment Safety, Staff Training, Emergency Preparedness, Facility Cleanliness, Member Safety Protocols, First Aid Readiness.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                overall: number;
                categories: Array<{ name: string; score: number; issues: string[] }>;
                trend: string;
                recommendations: string[];
                urgentActions: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-safety-monitor',
                temperature: 0.4,
            });

            const record = await AISafetyMonitorModel.create({
                monitorId: uuidv4(),
                tenantId,
                locationId,
                type: 'SAFETY_SCORE',
                safetyScore: {
                    overall: aiResult.overall,
                    categories: aiResult.categories,
                    trend: aiResult.trend,
                },
            });

            logger.info(`AI Safety Monitor: Safety score for location ${locationId} — overall: ${aiResult.overall}/100, trend: ${aiResult.trend}`);

            return {
                monitorId: record.monitorId,
                locationId,
                safetyScore: {
                    overall: aiResult.overall,
                    categories: aiResult.categories,
                    trend: aiResult.trend,
                },
                recommendations: aiResult.recommendations,
                urgentActions: aiResult.urgentActions,
                assessedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Safety Monitor safety score failed for location ${locationId}:`, error.message);
            return {
                locationId,
                safetyScore: {
                    overall: 0,
                    categories: [],
                    trend: 'unknown',
                },
                recommendations: ['Manual safety assessment required'],
                urgentActions: ['Schedule in-person safety inspection'],
                assessedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get Incident Predictions ────────────────────────────────
    async getIncidentPredictions(tenantId: string) {
        try {
            const historicalData = await AISafetyMonitorModel.find({
                tenantId,
                type: { $in: ['SAFETY_SCORE', 'INCIDENT_PREDICTION'] },
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            const prompt = {
                system: `You are an expert fitness facility risk prediction analyst. RESPOND ONLY with valid JSON: { "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL", "predictedIncidents": [{ "type": "string", "probability": number (0-100), "mitigationSteps": ["string"], "timeframe": "string", "severity": "string" }], "overallRiskTrend": "string", "preventiveActions": ["string"] }`,
                user: `Predict potential safety incidents for a fitness business.
Tenant ID: ${tenantId}
Historical Safety Data: ${historicalData.length > 0 ? JSON.stringify(historicalData.map(d => ({ type: d.type, safetyScore: d.safetyScore, incidents: d.incidentPrediction, date: d.createdAt }))) : 'No historical data available'}
Predict likely incidents based on common fitness facility risks: equipment malfunction, slip/fall, overexertion injuries, medical emergencies, facility hazards.`,
            };

            const aiResult = await aiService.jsonCompletion<{
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
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-safety-monitor',
                temperature: 0.4,
            });

            const record = await AISafetyMonitorModel.create({
                monitorId: uuidv4(),
                tenantId,
                type: 'INCIDENT_PREDICTION',
                incidentPrediction: {
                    riskLevel: aiResult.riskLevel,
                    predictedIncidents: aiResult.predictedIncidents.map(i => ({
                        type: i.type,
                        probability: i.probability,
                        mitigationSteps: i.mitigationSteps,
                    })),
                },
            });

            logger.info(`AI Safety Monitor: Incident predictions for tenant ${tenantId} — risk level: ${aiResult.riskLevel}, ${aiResult.predictedIncidents.length} predicted incidents`);

            return {
                monitorId: record.monitorId,
                riskLevel: aiResult.riskLevel,
                predictedIncidents: aiResult.predictedIncidents,
                overallRiskTrend: aiResult.overallRiskTrend,
                preventiveActions: aiResult.preventiveActions,
                predictedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Safety Monitor incident predictions failed for tenant ${tenantId}:`, error.message);
            return {
                riskLevel: 'UNKNOWN',
                predictedIncidents: [],
                overallRiskTrend: 'Unable to determine',
                preventiveActions: ['Conduct manual risk assessment'],
                predictedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get Certification Alerts ────────────────────────────────
    async getCertificationAlerts(tenantId: string) {
        try {
            const existingAlerts = await AISafetyMonitorModel.find({
                tenantId,
                type: 'CERTIFICATION_ALERT',
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = {
                system: `You are an expert fitness certification compliance monitor. RESPOND ONLY with valid JSON: { "alerts": [{ "coachId": "string", "coachName": "string", "certificationName": "string", "expiryDate": "string (ISO date)", "daysUntilExpiry": number, "status": "VALID|EXPIRING_SOON|EXPIRED|CRITICAL", "renewalSteps": ["string"] }], "summary": { "totalCoaches": number, "expiringSoon": number, "expired": number, "critical": number }, "prioritizedActions": ["string"] }`,
                user: `Generate certification alert report for a fitness business.
Tenant ID: ${tenantId}
Previous Alerts: ${existingAlerts.length > 0 ? JSON.stringify(existingAlerts.map(a => a.certificationAlerts)) : 'No previous alerts'}
Check for common fitness certifications: CPR/AED, Personal Training (NASM/ACE/ISSA), Group Fitness, Specialty Certifications, First Aid, and facility licenses.
Prioritize alerts by urgency.`,
            };

            const aiResult = await aiService.jsonCompletion<{
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
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-safety-monitor',
                temperature: 0.3,
            });

            const record = await AISafetyMonitorModel.create({
                monitorId: uuidv4(),
                tenantId,
                type: 'CERTIFICATION_ALERT',
                certificationAlerts: aiResult.alerts.map(a => ({
                    coachId: a.coachId,
                    coachName: a.coachName,
                    certificationName: a.certificationName,
                    expiryDate: new Date(a.expiryDate),
                    daysUntilExpiry: a.daysUntilExpiry,
                    status: a.status,
                })),
            });

            logger.info(`AI Safety Monitor: Certification alerts for tenant ${tenantId} — ${aiResult.alerts.length} alerts, ${aiResult.summary.critical} critical`);

            return {
                monitorId: record.monitorId,
                alerts: aiResult.alerts,
                summary: aiResult.summary,
                prioritizedActions: aiResult.prioritizedActions,
                checkedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Safety Monitor certification alerts failed for tenant ${tenantId}:`, error.message);
            return {
                alerts: [],
                summary: { totalCoaches: 0, expiringSoon: 0, expired: 0, critical: 0 },
                prioritizedActions: ['Manually review all coach certifications'],
                checkedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get Emergency Guide ─────────────────────────────────────
    async getEmergencyGuide(data: any) {
        const { tenantId, locationId, scenario, facilityType } = data;

        try {
            const prompt = {
                system: `You are an expert emergency response coordinator for fitness facilities. RESPOND ONLY with valid JSON: { "scenario": "string", "steps": ["string"], "contactList": [{ "role": "string", "action": "string" }], "firstAidInstructions": "string", "evacuationProcedure": "string", "equipmentNeeded": ["string"], "postIncidentSteps": ["string"], "legalConsiderations": ["string"] }`,
                user: `Generate a comprehensive emergency response guide for a fitness facility.
Scenario: ${scenario}
Location ID: ${locationId || 'General'}
Facility Type: ${facilityType || 'Gym/Fitness Center'}
Tenant ID: ${tenantId}
Provide step-by-step emergency protocol with first aid instructions, contact roles, and post-incident procedures.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                scenario: string;
                steps: string[];
                contactList: Array<{ role: string; action: string }>;
                firstAidInstructions: string;
                evacuationProcedure: string;
                equipmentNeeded: string[];
                postIncidentSteps: string[];
                legalConsiderations: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-safety-monitor',
                temperature: 0.3,
            });

            const record = await AISafetyMonitorModel.create({
                monitorId: uuidv4(),
                tenantId,
                locationId,
                type: 'EMERGENCY_GUIDE',
                emergencyGuide: {
                    scenario: aiResult.scenario,
                    steps: aiResult.steps,
                    contactList: aiResult.contactList,
                    firstAidInstructions: aiResult.firstAidInstructions,
                },
            });

            logger.info(`AI Safety Monitor: Emergency guide generated for scenario "${scenario}" at location ${locationId || 'general'}`);

            return {
                monitorId: record.monitorId,
                ...aiResult,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Safety Monitor emergency guide failed for scenario "${scenario}":`, error.message);
            return {
                scenario: scenario || 'General Emergency',
                steps: [
                    'Ensure personal safety first',
                    'Call emergency services (911)',
                    'Administer first aid if trained',
                    'Evacuate if necessary',
                    'Contact facility manager',
                    'Document the incident',
                ],
                contactList: [
                    { role: 'Front Desk', action: 'Call 911 and notify management' },
                    { role: 'Manager', action: 'Coordinate response and documentation' },
                ],
                firstAidInstructions: 'Follow basic first aid protocols. Do not move injured persons unless danger is present.',
                evacuationProcedure: 'Follow posted evacuation routes',
                equipmentNeeded: ['First aid kit', 'AED'],
                postIncidentSteps: ['Complete incident report', 'Notify insurance'],
                legalConsiderations: ['Document everything', 'Preserve evidence'],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Run Compliance Audit ────────────────────────────────────
    async runComplianceAudit(locationId: string, tenantId: string) {
        try {
            const safetyHistory = await AISafetyMonitorModel.find({
                tenantId,
                locationId,
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            const prompt = {
                system: `You are an expert fitness facility compliance auditor. RESPOND ONLY with valid JSON: { "overallCompliance": number (0-100), "areas": [{ "area": "string", "status": "COMPLIANT|NEEDS_IMPROVEMENT|NON_COMPLIANT|CRITICAL", "findings": ["string"], "recommendations": ["string"] }], "criticalIssues": ["string"], "nextAuditDate": "string", "complianceGrade": "string", "regulatoryNotes": ["string"] }`,
                user: `Conduct a comprehensive compliance audit for a fitness facility.
Location ID: ${locationId}
Tenant ID: ${tenantId}
Safety History: ${safetyHistory.length > 0 ? JSON.stringify(safetyHistory.map(s => ({ type: s.type, safetyScore: s.safetyScore, compliance: s.complianceAudit, date: s.createdAt }))) : 'No previous audit data'}
Audit areas: Health & Safety Regulations, Equipment Maintenance, Staff Certifications, Emergency Preparedness, Accessibility, Insurance & Liability, Data Privacy, Sanitation Standards.`,
            };

            const aiResult = await aiService.jsonCompletion<{
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
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-safety-monitor',
                temperature: 0.4,
            });

            const record = await AISafetyMonitorModel.create({
                monitorId: uuidv4(),
                tenantId,
                locationId,
                type: 'COMPLIANCE_AUDIT',
                complianceAudit: {
                    overallCompliance: aiResult.overallCompliance,
                    areas: aiResult.areas,
                    criticalIssues: aiResult.criticalIssues,
                },
            });

            logger.info(`AI Safety Monitor: Compliance audit for location ${locationId} — overall: ${aiResult.overallCompliance}%, grade: ${aiResult.complianceGrade}`);

            return {
                monitorId: record.monitorId,
                locationId,
                ...aiResult,
                auditedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Safety Monitor compliance audit failed for location ${locationId}:`, error.message);
            return {
                locationId,
                overallCompliance: 0,
                areas: [],
                criticalIssues: ['Compliance audit unavailable — manual review required'],
                nextAuditDate: 'ASAP',
                complianceGrade: 'N/A',
                regulatoryNotes: ['Schedule in-person compliance inspection'],
                auditedAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
