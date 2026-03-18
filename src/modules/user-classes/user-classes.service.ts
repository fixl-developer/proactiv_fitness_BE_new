import { UserClassModel } from './user-classes.model';
import { IUserClass, IEnrollClassDto, IClassFeedbackDto } from './user-classes.interface';

export class UserClassesService {
    async getMyClasses(userId: string, status?: string): Promise<IUserClass[]> {
        const query: any = { userId };
        if (status) query.status = status;
        return await UserClassModel.find(query).sort({ enrollmentDate: -1 }).lean();
    }

    async getClassById(userId: string, classId: string): Promise<IUserClass | null> {
        return await UserClassModel.findOne({ userId, classId }).lean();
    }

    async enrollClass(userId: string, enrollData: IEnrollClassDto): Promise<IUserClass> {
        const userClass = new UserClassModel({
            userId,
            ...enrollData,
            status: 'active'
        });
        return await userClass.save();
    }

    async updateClassStatus(userId: string, classId: string, status: string): Promise<IUserClass | null> {
        return await UserClassModel.findOneAndUpdate(
            { userId, classId },
            { $set: { status, updatedAt: new Date() } },
            { new: true }
        ).lean();
    }

    async getClassAttendance(userId: string, classId: string): Promise<any> {
        const userClass = await UserClassModel.findOne({ userId, classId }, 'attendance').lean();
        return userClass?.attendance || null;
    }

    async submitFeedback(userId: string, classId: string, feedbackData: IClassFeedbackDto): Promise<void> {
        await UserClassModel.findOneAndUpdate(
            { userId, classId },
            {
                $set: {
                    'performance.rating': feedbackData.rating,
                    'performance.lastFeedbackDate': new Date()
                },
                $push: { 'performance.feedback': feedbackData.feedback }
            }
        );
    }

    async getActiveClasses(userId: string): Promise<IUserClass[]> {
        return await UserClassModel.find({ userId, status: 'active' }).lean();
    }

    async getCompletedClasses(userId: string): Promise<IUserClass[]> {
        return await UserClassModel.find({ userId, status: 'completed' }).lean();
    }

    async addMaterial(userId: string, classId: string, material: any): Promise<void> {
        await UserClassModel.findOneAndUpdate(
            { userId, classId },
            { $push: { materials: material } }
        );
    }
}

export const userClassesService = new UserClassesService();
