import { UserProfileModel } from './user-profile.model';
import { IUserProfile, IUpdateProfileDto } from './user-profile.interface';
import { User } from '../iam/user.model';

export class UserProfileService {
    async getProfile(userId: string): Promise<IUserProfile | null> {
        const existing = await UserProfileModel.findOne({ userId }).lean();
        if (existing) return existing;

        // No profile row yet — auto-provision from the User document so the
        // /user/profile page works for every user immediately after registration
        // without requiring a separate profile-creation step.
        const user: any = await User.findById(userId).lean();
        if (!user) return null;

        const genderMap: Record<string, 'male' | 'female' | 'other'> = {
            MALE: 'male', FEMALE: 'female', OTHER: 'other',
            male: 'male', female: 'female', other: 'other',
        };

        const seed: Partial<IUserProfile> = {
            userId,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || `${userId}@placeholder.local`,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender ? genderMap[user.gender] : undefined,
            avatar: user.profileImage,
            address: user.address ? {
                street: user.address.street,
                city: user.address.city,
                state: user.address.state,
                zipCode: user.address.postalCode,
                country: user.address.country,
            } : undefined,
        };

        try {
            const created = await UserProfileModel.create(seed);
            return created.toObject() as IUserProfile;
        } catch (err: any) {
            // Race condition or unique-index conflict (e.g. another request
            // just created the row) — fall back to the existing record.
            if (err?.code === 11000) {
                return await UserProfileModel.findOne({ userId }).lean();
            }
            throw err;
        }
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
