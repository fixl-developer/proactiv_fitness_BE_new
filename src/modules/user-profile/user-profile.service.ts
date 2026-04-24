import { UserProfileModel } from './user-profile.model';
import { IUserProfile, IUpdateProfileDto } from './user-profile.interface';

export class UserProfileService {
    async getProfile(userId: string): Promise<IUserProfile | null> {
        return await UserProfileModel.findOne({ userId }).lean();
    }

    async createProfile(profileData: Partial<IUserProfile>): Promise<IUserProfile> {
        const profile = new UserProfileModel(profileData);
        return await profile.save();
    }

    async updateProfile(userId: string, updateData: IUpdateProfileDto): Promise<IUserProfile | null> {
        return await UserProfileModel.findOneAndUpdate(
            { userId },
            { $set: updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).lean();
    }

    async updateAvatar(userId: string, avatarUrl: string): Promise<IUserProfile | null> {
        return await UserProfileModel.findOneAndUpdate(
            { userId },
            { $set: { avatar: avatarUrl }, updatedAt: new Date() },
            { new: true }
        ).lean();
    }

    async deleteAvatar(userId: string): Promise<IUserProfile | null> {
        return await UserProfileModel.findOneAndUpdate(
            { userId },
            { $unset: { avatar: '' }, updatedAt: new Date() },
            { new: true }
        ).lean();
    }

    async updateStats(userId: string, stats: Partial<IUserProfile['stats']>): Promise<void> {
        await UserProfileModel.findOneAndUpdate(
            { userId },
            { $set: { 'stats': stats }, updatedAt: new Date() }
        );
    }

    async updateLastActive(userId: string): Promise<void> {
        await UserProfileModel.findOneAndUpdate(
            { userId },
            { $set: { 'stats.lastActive': new Date() } }
        );
    }

    async getProfileStats(userId: string): Promise<IUserProfile['stats'] | null> {
        const profile = await UserProfileModel.findOne({ userId }, 'stats').lean();
        return profile?.stats || null;
    }
}

export const userProfileService = new UserProfileService();
