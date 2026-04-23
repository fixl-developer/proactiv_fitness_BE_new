import { CapacityMonitor, RebalanceExecution } from './capacity.model';
import { IMonitorCapacityRequest, IExecuteRebalanceRequest, ICapacitySummary, ClassStatus, RebalanceAction } from './capacity.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class CapacityOptimizerService {
    // ─── AI-Powered Capacity Monitoring ────────────────────────
    async monitorCapacity(data: IMonitorCapacityRequest, userId: string): Promise<any> {
        const monitorId = uuidv4();

        try {
            // Query existing booking/capacity data for this class
            const existingMonitors = await CapacityMonitor.find({
                classId: data.classId,
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            // Calculate real capacity from data if provided, otherwise use defaults
            const capacity = {
                total: (data as any).totalCapacity || 20,
                booked: (data as any).bookedCount || 0,
                available: 0,
                waitlist: (data as any).waitlistCount || 0,
                utilizationRate: 0,
            };
            capacity.available = capacity.total - capacity.booked;
            capacity.utilizationRate = Math.round((capacity.booked / capacity.total) * 100);

            const status = this.determineClassStatus(capacity.utilizationRate);

            // Use AI for intelligent recommendations
            const prompt = AIPromptService.capacityOptimization({
                classData: {
                    classId: data.classId,
                    className: (data as any).className || 'Class',
                    capacity,
                    status,
                    scheduleDate: data.scheduleDate,
                },
                bookingData: {
                    booked: capacity.booked,
                    total: capacity.total,
                    waitlist: capacity.waitlist,
                },
                historicalUtilization: existingMonitors.map(m => ({
                    date: m.scheduleDate,
                    utilization: m.capacity?.utilizationRate,
                    status: m.status,
                })),
            });

            const aiRecommendations = await aiService.jsonCompletion<{
                currentStatus: string;
                utilizationRate: number;
                recommendations: Array<{
                    action: string;
                    priority: string;
                    reason: string;
                    estimatedImpact: {
                        utilizationImprovement: number;
                        revenueImpact: number;
                        customerSatisfaction: string;
                    };
                    implementationSteps: string[];
                }>;
                peakHoursAnalysis: string;
                overallAssessment: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'capacity-optimizer',
                temperature: 0.4,
            });

            const recommendations = aiRecommendations.recommendations.map(rec => ({
                recommendationId: uuidv4(),
                action: this.mapRecommendationAction(rec.action),
                priority: rec.priority,
                reason: rec.reason,
                estimatedImpact: rec.estimatedImpact,
                suggestedActions: rec.implementationSteps,
                affectedStudents: capacity.booked,
            }));

            const monitor = new CapacityMonitor({
                monitorId,
                classId: data.classId,
                className: (data as any).className || 'Class',
                scheduleDate: data.scheduleDate,
                scheduleTime: (data as any).scheduleTime || '10:00 AM',
                capacity,
                status,
                rebalanceRecommendations: recommendations,
                aiAnalysis: {
                    peakHoursAnalysis: aiRecommendations.peakHoursAnalysis,
                    overallAssessment: aiRecommendations.overallAssessment,
                    aiPowered: true,
                },
                nextCheckDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
                businessUnitId: (data as any).businessUnitId || 'bu-001',
                locationId: (data as any).locationId || 'loc-001',
                createdBy: userId,
                updatedBy: userId,
            });

            const saved = await monitor.save();

            logger.info(`Capacity Optimizer: Monitored class ${data.classId} — Status: ${status}, Utilization: ${capacity.utilizationRate}%, AI Recommendations: ${recommendations.length}`);

            return saved;
        } catch (error: any) {
            logger.error(`Capacity Optimizer monitoring failed for class ${data.classId}:`, error.message);

            // Fallback without AI
            const capacity = { total: 20, booked: 0, available: 20, waitlist: 0, utilizationRate: 0 };
            const status = ClassStatus.UNDERBOOKED;

            const monitor = new CapacityMonitor({
                monitorId,
                classId: data.classId,
                className: 'Class',
                scheduleDate: data.scheduleDate,
                scheduleTime: '10:00 AM',
                capacity,
                status,
                rebalanceRecommendations: this.generateFallbackRecommendations(capacity, status),
                nextCheckDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
                businessUnitId: 'bu-001',
                locationId: 'loc-001',
                createdBy: userId,
                updatedBy: userId,
            });

            return await monitor.save();
        }
    }

    // ─── Execute Rebalance with AI Follow-up ───────────────────
    async executeRebalance(data: IExecuteRebalanceRequest, userId: string): Promise<any> {
        const executionId = uuidv4();

        const execution = new RebalanceExecution({
            executionId,
            recommendationId: data.recommendationId,
            action: data.action,
            sourceClass: {
                classId: data.sourceClassId,
                className: (data as any).sourceClassName || 'Source Class',
                scheduleDate: new Date(),
                studentsAffected: (data as any).studentsAffected || 0,
            },
            targetClass: data.targetClassId ? {
                classId: data.targetClassId,
                className: (data as any).targetClassName || 'Target Class',
                scheduleDate: new Date(),
            } : undefined,
            results: {
                studentsNotified: (data as any).studentsAffected || 0,
                studentsAccepted: 0,
                studentsDeclined: 0,
                utilizationBefore: (data as any).utilizationBefore || 0,
                utilizationAfter: (data as any).utilizationAfter || 0,
                revenueImpact: (data as any).revenueImpact || 0,
            },
            businessUnitId: (data as any).businessUnitId || 'bu-001',
            createdBy: userId,
            updatedBy: userId,
        });

        const saved = await execution.save();

        logger.info(`Capacity Optimizer: Executed rebalance ${executionId} — Action: ${data.action}`);

        return saved;
    }

    // ─── AI-Enhanced Capacity Summary ──────────────────────────
    async getCapacitySummary(locationId: string): Promise<ICapacitySummary> {
        const monitors = await CapacityMonitor.find({ locationId });

        const totalClasses = monitors.length;
        const underbookedClasses = monitors.filter(m => m.status === ClassStatus.UNDERBOOKED).length;
        const averageUtilization = monitors.reduce((sum, m) => sum + (m.capacity?.utilizationRate || 0), 0) / (totalClasses || 1);

        // Estimate revenue gain from AI recommendations
        const rebalanceOpportunities = monitors.filter(m => m.rebalanceRecommendations?.length > 0).length;
        const estimatedRevenueGain = rebalanceOpportunities * 500 + underbookedClasses * 200;

        return {
            totalClasses,
            underbookedClasses,
            optimalClasses: monitors.filter(m => m.status === ClassStatus.OPTIMAL).length,
            fullClasses: monitors.filter(m => m.status === ClassStatus.FULL).length,
            overbookedClasses: monitors.filter(m => m.status === ClassStatus.OVERBOOKED).length,
            averageUtilization: Math.round(averageUtilization),
            rebalanceOpportunities,
            potentialRevenueGain: estimatedRevenueGain,
        };
    }

    // ─── Helper Methods ────────────────────────────────────────

    private determineClassStatus(utilizationRate: number): ClassStatus {
        if (utilizationRate < 50) return ClassStatus.UNDERBOOKED;
        if (utilizationRate >= 50 && utilizationRate < 80) return ClassStatus.OPTIMAL;
        if (utilizationRate >= 80 && utilizationRate < 100) return ClassStatus.FULL;
        return ClassStatus.OVERBOOKED;
    }

    private mapRecommendationAction(action: string): RebalanceAction {
        const mapping: Record<string, RebalanceAction> = {
            MERGE_CLASSES: RebalanceAction.MERGE_CLASSES,
            SPLIT_CLASS: RebalanceAction.SPLIT_CLASS,
            MOVE_STUDENTS: RebalanceAction.MOVE_STUDENTS,
            CANCEL_CLASS: RebalanceAction.CANCEL_CLASS,
            ADD_CLASS: RebalanceAction.ADD_CLASS,
        };
        return mapping[action] || RebalanceAction.MOVE_STUDENTS;
    }

    private generateFallbackRecommendations(capacity: any, status: ClassStatus): any[] {
        if (status === ClassStatus.UNDERBOOKED) {
            return [{
                recommendationId: uuidv4(),
                action: RebalanceAction.MERGE_CLASSES,
                priority: 'high',
                reason: 'Low utilization - consider merging with similar class',
                estimatedImpact: { utilizationImprovement: 35, revenueImpact: 500, customerSatisfaction: 'neutral' },
                suggestedActions: ['Merge with nearby class', 'Offer discount to fill'],
                affectedStudents: capacity.booked,
            }];
        }
        return [];
    }
}
