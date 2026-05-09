import { UserProgressModel } from './user-progress.model';
import { IUserProgress, IUpdateProgressDto } from './user-progress.interface';

export class UserProgressService {
    async getProgress(userId: string): Promise<IUserProgress | null> {
        return await UserProgressModel.findOne({ userId }).lean();
    }

    async createProgress(userId: string): Promise<IUserProgress> {
        const progress = new UserProgressModel({ userId });
        return await progress.save();
    }

    async updateProgress(userId: string, updateData: IUpdateProgressDto): Promise<IUserProgress | null> {
        return await UserProgressModel.findOneAndUpdate(
            { userId },
            { $set: updateData, updatedAt: new Date() },
            { new: true, upsert: true }
        ).lean();
    }

    async addMilestone(userId: string, milestone: any): Promise<void> {
        await UserProgressModel.findOneAndUpdate(
            { userId },
            { $push: { milestones: milestone } }
        );
    }

    async updateSkillLevel(userId: string, skillName: string, level: number, progress: number): Promise<void> {
        await UserProgressModel.findOneAndUpdate(
            { userId },
            {
                $set: {
                    'skillLevels.$[elem].level': level,
                    'skillLevels.$[elem].progress': progress,
                    'skillLevels.$[elem].lastUpdated': new Date()
                }
            },
            { arrayFilters: [{ 'elem.skillName': skillName }] }
        );
    }

    async addTimelineEvent(userId: string, event: any): Promise<void> {
        await UserProgressModel.findOneAndUpdate(
            { userId },
            { $push: { timeline: event } }
        );
    }

    async getTimeline(userId: string): Promise<any[]> {
        const progress = await UserProgressModel.findOne({ userId }, 'timeline').lean();
        return progress?.timeline || [];
    }

    async getSkillLevels(userId: string): Promise<any[]> {
        const progress = await UserProgressModel.findOne({ userId }, 'skillLevels').lean();
        return progress?.skillLevels || [];
    }

    async getPerformanceMetrics(userId: string): Promise<any> {
        const progress = await UserProgressModel.findOne({ userId }, 'performanceMetrics').lean();
        return progress?.performanceMetrics || null;
    }

    async addGoal(userId: string, goalData: any): Promise<any> {
        const goal = {
            id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            goalType: goalData.goalType,
            target: String(goalData.target ?? ''),
            deadline: goalData.deadline ? new Date(goalData.deadline) : undefined,
            notes: goalData.notes || '',
            status: 'active',
            createdAt: new Date(),
        };
        await UserProgressModel.findOneAndUpdate(
            { userId },
            { $push: { goals: goal } },
            { new: true, upsert: true }
        );
        return goal;
    }

    async getGoals(userId: string): Promise<any[]> {
        const progress = await UserProgressModel.findOne({ userId }, 'goals').lean();
        return (progress as any)?.goals || [];
    }
}

export const userProgressService = new UserProgressService();
