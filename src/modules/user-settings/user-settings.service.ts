import { UserSettingsModel, IUserSettings } from './user-settings.model'

export class UserSettingsService {
    async getSettings(userId: string): Promise<IUserSettings | null> {
        try {
            let settings = await UserSettingsModel.findOne({ userId })
            if (!settings) {
                settings = await UserSettingsModel.create({
                    userId,
                    email: '',
                    notifications: {
                        emailNotifications: true,
                        smsNotifications: false,
                        pushNotifications: true,
                        classReminders: true,
                        paymentAlerts: true,
                        promotionalEmails: false
                    },
                    privacy: {
                        profileVisibility: 'private',
                        showAchievements: true,
                        showProgress: true,
                        allowMessaging: true
                    }
                })
            }
            return settings
        } catch (error) {
            console.error('Error fetching settings:', error)
            throw error
        }
    }

    async updateSettings(userId: string, data: Partial<IUserSettings>): Promise<IUserSettings | null> {
        try {
            const settings = await UserSettingsModel.findOneAndUpdate(
                { userId },
                { $set: data },
                { new: true, upsert: true }
            )
            return settings
        } catch (error) {
            console.error('Error updating settings:', error)
            throw error
        }
    }

    async updateNotificationPreferences(userId: string, preferences: any): Promise<IUserSettings | null> {
        try {
            const settings = await UserSettingsModel.findOneAndUpdate(
                { userId },
                { $set: { notifications: preferences } },
                { new: true, upsert: true }
            )
            return settings
        } catch (error) {
            console.error('Error updating notification preferences:', error)
            throw error
        }
    }

    async updatePrivacySettings(userId: string, privacy: any): Promise<IUserSettings | null> {
        try {
            const settings = await UserSettingsModel.findOneAndUpdate(
                { userId },
                { $set: { privacy } },
                { new: true, upsert: true }
            )
            return settings
        } catch (error) {
            console.error('Error updating privacy settings:', error)
            throw error
        }
    }

    async deleteSettings(userId: string): Promise<void> {
        try {
            await UserSettingsModel.deleteOne({ userId })
        } catch (error) {
            console.error('Error deleting settings:', error)
            throw error
        }
    }
}

export default new UserSettingsService()
