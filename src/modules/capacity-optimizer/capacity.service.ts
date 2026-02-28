import { CapacityMonitor, RebalanceExecution } from './capacity.model';
import { IMonitorCapacityRequest, IExecuteRebalanceRequest, ICapacitySummary, ClassStatus, RebalanceAction } from './capacity.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class CapacityOptimizerService {
    async monitorCapacity(data: IMonitorCapacityRequest, userId: string): Promise<any> {
        const monitorId = uuidv4();

        // Mock capacity data - in real implementation, fetch from booking system
        const capacity = {
            total: 20,
            booked: 8,
            available: 12,
            waitlist: 0,
            utilizationRate: 40
        };

        const status = this.determineClassStatus(capacity.utilizationRate);
        const recommendations = this.generateRecommendations(capacity, status);

        const monitor = new CapacityMonitor({
            monitorId,
            classId: data.classId,
            className: 'Sample Class',
            scheduleDate: data.scheduleDate,
            scheduleTime: '10:00 AM',
            capacity,
            status,
            rebalanceRecommendations: recommendations,
            nextCheckDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
            businessUnitId: 'bu-001',
            locationId: 'loc-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await monitor.save();
    }

    async executeRebalance(data: IExecuteRebalanceRequest, userId: string): Promise<any> {
        const executionId = uuidv4();

        const execution = new RebalanceExecution({
            executionId,
            recommendationId: data.recommendationId,
            action: data.action,
            sourceClass: {
                classId: data.sourceClassId,
                className: 'Source Class',
                scheduleDate: new Date(),
                studentsAffected: 5
            },
            targetClass: data.targetClassId ? {
                classId: data.targetClassId,
                className: 'Target Class',
                scheduleDate: new Date()
            } : undefined,
            results: {
                studentsNotified: 5,
                studentsAccepted: 4,
                studentsDeclined: 1,
                utilizationBefore: 40,
                utilizationAfter: 75,
                revenueImpact: 500
            },
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await execution.save();
    }

    async getCapacitySummary(locationId: string): Promise<ICapacitySummary> {
        const monitors = await CapacityMonitor.find({ locationId });

        return {
            totalClasses: monitors.length,
            underbookedClasses: monitors.filter(m => m.status === ClassStatus.UNDERBOOKED).length,
            optimalClasses: monitors.filter(m => m.status === ClassStatus.OPTIMAL).length,
            fullClasses: monitors.filter(m => m.status === ClassStatus.FULL).length,
            overbookedClasses: monitors.filter(m => m.status === ClassStatus.OVERBOOKED).length,
            averageUtilization: monitors.reduce((sum, m) => sum + m.capacity.utilizationRate, 0) / (monitors.length || 1),
            rebalanceOpportunities: monitors.filter(m => m.rebalanceRecommendations.length > 0).length,
            potentialRevenueGain: 5000
        };
    }

    private determineClassStatus(utilizationRate: number): ClassStatus {
        if (utilizationRate < 50) return ClassStatus.UNDERBOOKED;
        if (utilizationRate >= 50 && utilizationRate < 80) return ClassStatus.OPTIMAL;
        if (utilizationRate >= 80 && utilizationRate < 100) return ClassStatus.FULL;
        return ClassStatus.OVERBOOKED;
    }

    private generateRecommendations(capacity: any, status: ClassStatus): any[] {
        if (status === ClassStatus.UNDERBOOKED) {
            return [{
                recommendationId: uuidv4(),
                action: RebalanceAction.MERGE_CLASSES,
                priority: 'high',
                reason: 'Low utilization - consider merging with similar class',
                estimatedImpact: {
                    utilizationImprovement: 35,
                    revenueImpact: 500,
                    customerSatisfaction: 0
                },
                suggestedActions: ['Merge with nearby class', 'Offer discount to fill', 'Cancel and refund'],
                affectedStudents: capacity.booked
            }];
        }
        return [];
    }
}
