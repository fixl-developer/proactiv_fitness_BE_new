import { WearableDevice, FitnessData, FitnessGoal } from './wearables.model';
import logger from '@/shared/utils/logger.util';

class WearablesService {
    async getConnectedDevices(userId: string) {
        try {
            return await WearableDevice.find({ userId, connected: true }).lean();
        } catch (error) {
            logger.error(`Error getting connected devices for user ${userId}:`, error);
            return [];
        }
    }

    async connectDevice(userId: string, data: any) {
        const device = new WearableDevice({ ...data, userId, connected: true, connectedAt: new Date() });
        await device.save();
        logger.info(`Device connected for user ${userId}: ${device._id}`);
        return device;
    }

    async disconnectDevice(deviceId: string) {
        await WearableDevice.findByIdAndUpdate(deviceId, { connected: false });
        logger.info(`Device disconnected: ${deviceId}`);
    }

    async syncDevice(deviceId: string) {
        const device = await WearableDevice.findByIdAndUpdate(
            deviceId,
            { lastSync: new Date() },
            { new: true }
        );
        logger.info(`Device synced: ${deviceId}`);
        return { success: true, lastSync: device?.lastSync };
    }

    async getFitnessData(userId: string, filters: any) {
        try {
            const query: any = { userId };

            if (filters.startDate || filters.endDate) {
                query.date = {};
                if (filters.startDate) {
                    query.date.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query.date.$lte = new Date(filters.endDate);
                }
            }

            if (filters.deviceId) {
                query.deviceId = filters.deviceId;
            }

            const limit = parseInt(filters.limit, 10) || 30;
            const page = parseInt(filters.page, 10) || 1;
            const skip = (page - 1) * limit;

            return await FitnessData.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (error) {
            logger.error(`Error getting fitness data for user ${userId}:`, error);
            return [];
        }
    }

    async getTodayStats(userId: string) {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const data = await FitnessData.findOne({
                userId,
                date: { $gte: todayStart, $lte: todayEnd },
            }).lean();

            if (!data) {
                return {
                    date: todayStart.toISOString().split('T')[0],
                    steps: 0,
                    calories: 0,
                    distance: 0,
                    heartRate: 0,
                    sleep: 0,
                    activeMinutes: 0,
                };
            }

            return {
                date: new Date(data.date).toISOString().split('T')[0],
                steps: data.steps,
                calories: data.calories,
                distance: data.distance,
                heartRate: data.heartRate,
                sleep: data.sleep,
                activeMinutes: data.activeMinutes,
            };
        } catch (error) {
            logger.error(`Error getting today stats for user ${userId}:`, error);
            return {
                date: new Date().toISOString().split('T')[0],
                steps: 0,
                calories: 0,
                distance: 0,
                heartRate: 0,
                sleep: 0,
                activeMinutes: 0,
            };
        }
    }

    async getWeeklyStats(userId: string) {
        try {
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);

            const data = await FitnessData.find({
                userId,
                date: { $gte: startDate, $lte: endDate },
            })
                .sort({ date: -1 })
                .lean();

            // Build a map for quick lookup
            const dataMap = new Map<string, any>();
            for (const entry of data) {
                const key = new Date(entry.date).toISOString().split('T')[0];
                dataMap.set(key, entry);
            }

            // Return an entry for each of the 7 days, filling gaps with zeros
            const result = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const entry = dataMap.get(dateStr);
                result.push({
                    date: dateStr,
                    steps: entry?.steps ?? 0,
                    calories: entry?.calories ?? 0,
                    distance: entry?.distance ?? 0,
                    heartRate: entry?.heartRate ?? 0,
                    sleep: entry?.sleep ?? 0,
                    activeMinutes: entry?.activeMinutes ?? 0,
                });
            }

            return result;
        } catch (error) {
            logger.error(`Error getting weekly stats for user ${userId}:`, error);
            return [];
        }
    }

    async getMonthlyStats(userId: string) {
        try {
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);

            const data = await FitnessData.find({
                userId,
                date: { $gte: startDate, $lte: endDate },
            })
                .sort({ date: -1 })
                .lean();

            const dataMap = new Map<string, any>();
            for (const entry of data) {
                const key = new Date(entry.date).toISOString().split('T')[0];
                dataMap.set(key, entry);
            }

            const result = [];
            for (let i = 0; i < 30; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const entry = dataMap.get(dateStr);
                result.push({
                    date: dateStr,
                    steps: entry?.steps ?? 0,
                    calories: entry?.calories ?? 0,
                    distance: entry?.distance ?? 0,
                    heartRate: entry?.heartRate ?? 0,
                    sleep: entry?.sleep ?? 0,
                    activeMinutes: entry?.activeMinutes ?? 0,
                });
            }

            return result;
        } catch (error) {
            logger.error(`Error getting monthly stats for user ${userId}:`, error);
            return [];
        }
    }

    async setFitnessGoal(userId: string, data: any) {
        try {
            const goal = await FitnessGoal.findOneAndUpdate(
                { userId, type: data.type },
                {
                    ...data,
                    userId,
                    startDate: data.startDate || new Date(),
                    endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
                { new: true, upsert: true }
            );
            logger.info(`Fitness goal set for user ${userId}: ${goal._id}`);
            return goal;
        } catch (error) {
            logger.error(`Error setting fitness goal for user ${userId}:`, error);
            return { success: false };
        }
    }

    async getFitnessGoals(userId: string) {
        try {
            return await FitnessGoal.find({ userId }).sort({ createdAt: -1 }).lean();
        } catch (error) {
            logger.error(`Error getting fitness goals for user ${userId}:`, error);
            return [];
        }
    }

    async getFitnessInsights(userId: string) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const data = await FitnessData.find({
                userId,
                date: { $gte: thirtyDaysAgo },
            }).lean();

            if (!data.length) {
                return {
                    averageSteps: 0,
                    averageCalories: 0,
                    trends: { steps: 0, calories: 0, activeMinutes: 0 },
                    recommendations: [],
                };
            }

            const count = data.length;
            const totals = data.reduce(
                (acc, entry) => ({
                    steps: acc.steps + (entry.steps || 0),
                    calories: acc.calories + (entry.calories || 0),
                    activeMinutes: acc.activeMinutes + (entry.activeMinutes || 0),
                }),
                { steps: 0, calories: 0, activeMinutes: 0 }
            );

            const averageSteps = Math.round(totals.steps / count);
            const averageCalories = Math.round(totals.calories / count);
            const averageActiveMinutes = Math.round(totals.activeMinutes / count);

            // Calculate trends by comparing last 7 days vs previous 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

            const recentData = data.filter((d) => new Date(d.date) >= sevenDaysAgo);
            const previousData = data.filter(
                (d) => new Date(d.date) >= fourteenDaysAgo && new Date(d.date) < sevenDaysAgo
            );

            const calcAvg = (arr: any[], field: string) =>
                arr.length ? arr.reduce((s, e) => s + (e[field] || 0), 0) / arr.length : 0;

            const calcTrend = (recent: number, previous: number) =>
                previous === 0 ? 0 : Math.round(((recent - previous) / previous) * 100);

            const trends = {
                steps: calcTrend(calcAvg(recentData, 'steps'), calcAvg(previousData, 'steps')),
                calories: calcTrend(calcAvg(recentData, 'calories'), calcAvg(previousData, 'calories')),
                activeMinutes: calcTrend(calcAvg(recentData, 'activeMinutes'), calcAvg(previousData, 'activeMinutes')),
            };

            // Generate recommendations based on data
            const recommendations: string[] = [];
            if (averageSteps < 10000) {
                recommendations.push(`Your average daily steps are ${averageSteps}. Try to reach 10,000 steps per day.`);
            }
            if (averageActiveMinutes < 30) {
                recommendations.push('Aim for at least 30 active minutes per day for better cardiovascular health.');
            }
            if (averageCalories < 1800) {
                recommendations.push('Your calorie burn seems low. Consider adding more physical activities to your routine.');
            }

            return {
                averageSteps,
                averageCalories,
                trends,
                recommendations,
            };
        } catch (error) {
            logger.error(`Error getting fitness insights for user ${userId}:`, error);
            return {
                averageSteps: 0,
                averageCalories: 0,
                trends: { steps: 0, calories: 0, activeMinutes: 0 },
                recommendations: [],
            };
        }
    }
}

export default new WearablesService();
