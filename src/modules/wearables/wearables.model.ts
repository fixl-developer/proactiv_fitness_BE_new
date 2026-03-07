import mongoose, { Schema } from 'mongoose';

const WearableDeviceSchema = new Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    deviceType: { type: String, enum: ['apple_watch', 'fitbit', 'garmin', 'samsung', 'other'], required: true },
    deviceName: String,
    deviceId: { type: String, required: true },
    manufacturer: String,
    model: String,
    connected: { type: Boolean, default: true },
    lastSync: Date,
    batteryLevel: Number,
    firmwareVersion: String,
    permissions: [String]
}, { timestamps: true });

const WearableMetricsSchema = new Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true },
    timestamp: { type: Date, required: true, index: true },
    heartRate: Number,
    steps: Number,
    distance: Number,
    calories: Number,
    activeMinutes: Number,
    sleepDuration: Number,
    sleepQuality: Number,
    vo2Max: Number,
    restingHeartRate: Number,
    hrv: Number,
    stressLevel: Number,
    bloodOxygen: Number,
    temperature: Number
}, { timestamps: true });

WearableMetricsSchema.index({ userId: 1, timestamp: -1 });

const WorkoutLogSchema = new Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    deviceId: String,
    workoutType: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: Number,
    distance: Number,
    calories: Number,
    averageHeartRate: Number,
    maxHeartRate: Number,
    zones: [{
        zone: String,
        minBpm: Number,
        maxBpm: Number,
        duration: Number,
        percentage: Number
    }],
    route: Schema.Types.Mixed,
    autoDetected: { type: Boolean, default: false }
}, { timestamps: true });

const SleepDataSchema = new Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    deviceId: String,
    date: { type: Date, required: true, index: true },
    bedTime: Date,
    wakeTime: Date,
    totalDuration: Number,
    deepSleep: Number,
    lightSleep: Number,
    remSleep: Number,
    awake: Number,
    sleepScore: Number,
    quality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
}, { timestamps: true });

const RecoveryMetricsSchema = new Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    recoveryScore: Number,
    hrv: Number,
    restingHeartRate: Number,
    sleepQuality: Number,
    readiness: { type: String, enum: ['optimal', 'good', 'fair', 'poor'] },
    recommendations: [String]
}, { timestamps: true });

const GeofenceCheckinSchema = new Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    locationId: { type: String, required: true },
    deviceId: String,
    checkinTime: { type: Date, required: true },
    checkoutTime: Date,
    autoCheckin: { type: Boolean, default: true },
    latitude: Number,
    longitude: Number
}, { timestamps: true });

const WearableSyncSchema = new Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true },
    syncTime: { type: Date, default: Date.now },
    dataTypes: [String],
    recordsCount: Number,
    status: { type: String, enum: ['success', 'partial', 'failed'] },
    errors: [String]
}, { timestamps: true });

export const WearableDevice = mongoose.model('WearableDevice', WearableDeviceSchema);
export const WearableMetrics = mongoose.model('WearableMetrics', WearableMetricsSchema);
export const WorkoutLog = mongoose.model('WorkoutLog', WorkoutLogSchema);
export const SleepData = mongoose.model('SleepData', SleepDataSchema);
export const RecoveryMetrics = mongoose.model('RecoveryMetrics', RecoveryMetricsSchema);
export const GeofenceCheckin = mongoose.model('GeofenceCheckin', GeofenceCheckinSchema);
export const WearableSync = mongoose.model('WearableSync', WearableSyncSchema);
