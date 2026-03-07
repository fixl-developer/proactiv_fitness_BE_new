export interface IWearableDevice {
    id: string;
    userId: string;
    deviceType: 'apple_watch' | 'fitbit' | 'garmin' | 'samsung' | 'other';
    deviceName: string;
    deviceId: string;
    manufacturer: string;
    model: string;
    connected: boolean;
    lastSync: Date;
    batteryLevel?: number;
    firmwareVersion?: string;
    permissions: string[];
}

export interface IWearableMetrics {
    id: string;
    userId: string;
    deviceId: string;
    timestamp: Date;
    heartRate?: number;
    steps?: number;
    distance?: number;
    calories?: number;
    activeMinutes?: number;
    sleepDuration?: number;
    sleepQuality?: number;
    vo2Max?: number;
    restingHeartRate?: number;
    hrv?: number;
    stressLevel?: number;
    bloodOxygen?: number;
    temperature?: number;
}

export interface IWorkoutLog {
    id: string;
    userId: string;
    deviceId: string;
    workoutType: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    distance?: number;
    calories: number;
    averageHeartRate?: number;
    maxHeartRate?: number;
    zones: IHeartRateZone[];
    route?: any;
    autoDetected: boolean;
}

export interface IHeartRateZone {
    zone: string;
    minBpm: number;
    maxBpm: number;
    duration: number;
    percentage: number;
}

export interface ISleepData {
    id: string;
    userId: string;
    deviceId: string;
    date: Date;
    bedTime: Date;
    wakeTime: Date;
    totalDuration: number;
    deepSleep: number;
    lightSleep: number;
    remSleep: number;
    awake: number;
    sleepScore: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface IRecoveryMetrics {
    id: string;
    userId: string;
    date: Date;
    recoveryScore: number;
    hrv: number;
    restingHeartRate: number;
    sleepQuality: number;
    readiness: 'optimal' | 'good' | 'fair' | 'poor';
    recommendations: string[];
}

export interface IGeofenceCheckin {
    id: string;
    userId: string;
    locationId: string;
    deviceId: string;
    checkinTime: Date;
    checkoutTime?: Date;
    autoCheckin: boolean;
    latitude: number;
    longitude: number;
}

export interface IWearableSync {
    id: string;
    userId: string;
    deviceId: string;
    syncTime: Date;
    dataTypes: string[];
    recordsCount: number;
    status: 'success' | 'partial' | 'failed';
    errors?: string[];
}
