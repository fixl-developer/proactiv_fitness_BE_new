import { FeatureFlagsModel } from './feature-flags.model';
import { v4 as uuidv4 } from 'uuid';

export class FeatureFlagsService {
    async createFlag(data: any) {
        const { tenantId, name, description, enabled, rolloutPercentage, targetUsers } = data;

        const flag = new FeatureFlagsModel({
            flagId: uuidv4(),
            tenantId,
            name,
            description,
            enabled,
            rolloutPercentage: rolloutPercentage || 100,
            targetUsers: targetUsers || [],
        });

        await flag.save();
        return flag;
    }

    async getFlags(tenantId: string) {
        const flags = await FeatureFlagsModel.find({ tenantId });
        return flags;
    }

    async isFeatureEnabled(tenantId: string, featureName: string, userId: string): Promise<boolean> {
        const flag = await FeatureFlagsModel.findOne({ tenantId, name: featureName });

        if (!flag || !flag.enabled) {
            return false;
        }

        // Check rollout percentage
        if (flag.rolloutPercentage < 100) {
            const hash = userId.charCodeAt(0) % 100;
            return hash < flag.rolloutPercentage;
        }

        // Check target users
        if (flag.targetUsers && flag.targetUsers.length > 0) {
            return flag.targetUsers.includes(userId);
        }

        return true;
    }

    async updateFlag(flagId: string, updates: any) {
        const flag = await FeatureFlagsModel.findOneAndUpdate({ flagId }, updates, { new: true });
        return flag;
    }
}
