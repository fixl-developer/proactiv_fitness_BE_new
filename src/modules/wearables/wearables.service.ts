import { WearableDevice, WearableMetrics, WorkoutLog, SleepData, RecoveryMetrics, GeofenceCheckin, WearableSync } from './wearables.model';
import { IWearableDevice, IWearableMetrics, IWorkoutLog, ISleepData, IRecoveryMetrics, IGeofenceCheckin } from './wearables.interface';
import { AppError } from '../../utils/appError';
import { logger } from '../../utils/logger';

export class WearablesService {
    async connectDevice(data: Partial<IWearableDevice>): Promise<IWearableDevice> {
        try {
            const device = await WearableDevice.create({
                ...data,
                id: `device_${Date.now()}`,
                connected: true,
                lastSync: new Date()
            });
            return device.toObject();
        } catch (error) {
            logger.error('Error connecting device', { error });
            throw new AppError('Failed to connect device', 500);
        }
    }

    async getDevices(userId: string): Promise<IWearableDevice[]> {
        try {
            const devices = await WearableDevice.find({ userId });
            return devices.map(d => d.toObject());
        } catch (error) {
            logger.error('Error getting devices', { error });
            throw new AppError('Failed to get devices', 500);
        }
    }

    async syncData(userId: string, deviceId: string, data: any): Promise<any> {
        try {
            const syncRecord = await WearableSync.create({
                id: `sync_${Date.now()}`,
                userId,
                deviceId,
                syncTime: new Date(),
                dataTypes: Object.keys(data),
                recordsCount: 0,
                status: 'success'
            });

            if (data.metrics) {
                await this.saveMetrics(userId, deviceId, data.metrics);
                syncRecord.recordsCount += data.metrics.length;
            }

            if (data.workouts) {
                await this.saveWorkouts(userId, deviceId, data.workouts);
                syncRecord.recordsCount += data.workouts.length;
            }

            if (data.sleep) {
                await this.saveSleep(userId, deviceId, data.sleep);
                syncRecord.recordsCount += data.sleep.length;
            }

            await syncRecord.save();
            await WearableDevice.updateOne({ id: deviceId }, { lastSync: new Date() });

            return syncRecord.toObject();
        } catch (error) {
            logger.error('Error syncing data', { error });
            throw new AppError('Failed to sync data', 500);
        }
    }

    async getMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<IWearableMetrics[]> {
        try {
            const query: any = { userId };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const metrics = await WearableMetrics.find(query).sort({ timestamp: -1 }).limit(1000);
            return metrics.map(m => m.toObject());
        } catch (error) {
            logger.error('Error getting metrics', { error });
            throw new AppError('Failed to get metrics', 500);
        }
    }

    async logWorkout(data: Partial<IWorkoutLog>): Promise<IWorkoutLog> {
        try {
            const workout = await WorkoutLog.create({
                ...data,
                id: `workout_${Date.now()}`,
                autoDetected: data.autoDetected || false
            });
            return workout.toObject();
        } catch (error) {
            logger.error('Error logging workout', { error });
            throw new AppError('Failed to log workout', 500);
        }
    }

    async getHeartRate(userId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
        try {
            const query: any = { userId, heartRate: { $exists: true } };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const data = await WearableMetrics.find(query)
                .select('timestamp heartRate')
                .sort({ timestamp: 1 })
                .limit(1000);

            return data.map(d => ({ timestamp: d.timestamp, heartRate: d.get('heartRate') }));
        } catch (error) {
            logger.error('Error getting heart rate', { error });
            throw new AppError('Failed to get heart rate', 500);
        }
    }

    async getSleep(userId: string, days: number = 7): Promise<ISleepData[]> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const sleep = await SleepData.find({
                userId,
                date: { $gte: startDate }
            }).sort({ date: -1 });

            return sleep.map(s => s.toObject());
        } catch (error) {
            logger.error('Error getting sleep data', { error });
            throw new AppError('Failed to get sleep data', 500);
        }
    }

    async geofenceCheckin(data: Partial<IGeofenceCheckin>): Promise<IGeofenceCheckin> {
        try {
            const checkin = await GeofenceCheckin.create({
                ...data,
                id: `checkin_${Date.now()}`,
                checkinTime: new Date(),
                autoCheckin: true
            });

            logger.info('Geofence auto check-in', { userId: data.userId, locationId: data.locationId });
            return checkin.toObject();
        } catch (error) {
            logger.error('Error geofence checkin', { error });
            throw new AppError('Failed to process geofence checkin', 500);
        }
    }

    private async saveMetrics(userId: string, deviceId: string, metrics: any[]): Promise<void> {
        const records = metrics.map(m => ({
            id: `metric_${Date.now()}_${Math.random()}`,
            userId,
            deviceId,
            ...m
        }));
        await WearableMetrics.insertMany(records);
    }

    private async saveWorkouts(userId: string, deviceId: string, workouts: any[]): Promise<void> {
        const records = workouts.map(w => ({
            id: `workout_${Date.now()}_${Math.random()}`,
            userId,
            deviceId,
            ...w
        }));
        await WorkoutLog.insertMany(records);
    }

    private async saveSleep(userId: string, deviceId: string, sleep: any[]): Promise<void> {
        const records = sleep.map(s => ({
            id: `sleep_${Date.now()}_${Math.random()}`,
            userId,
            deviceId,
            ...s
        }));
        await SleepData.insertMany(records);
    }
}

export const wearablesService = new WearablesService();
