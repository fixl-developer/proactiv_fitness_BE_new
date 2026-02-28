import { FamilySchedule } from './scheduler.model';
import { IOptimizeScheduleRequest } from './scheduler.interface';
import { v4 as uuidv4 } from 'uuid';

export class FamilySchedulerService {
    async optimizeSchedule(data: IOptimizeScheduleRequest, userId: string): Promise<any> {
        const scheduleId = uuidv4();

        const schedule = new FamilySchedule({
            scheduleId,
            familyId: data.familyId,
            children: [],
            optimizationScore: 85,
            travelTimeMinutes: 45,
            carpoolOpportunities: 2,
            suggestions: [{
                suggestionId: uuidv4(),
                type: 'schedule_alignment',
                description: 'Align sibling classes on same day',
                estimatedSavings: {
                    timeMinutes: 30,
                    costAmount: 50
                },
                priority: 'high'
            }],
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await schedule.save();
    }

    async getSchedule(familyId: string): Promise<any> {
        return await FamilySchedule.findOne({ familyId });
    }
}
