import { Schema, model } from 'mongoose';
import { baseSchemaOptions } from '../../shared/base/base.model';

const wearableDeviceSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceType: { type: String, enum: ['fitbit', 'apple-watch', 'garmin', 'samsung', 'other'], required: true },
    deviceName: String,
    brand: String,
    model: String,
    connected: { type: Boolean, default: false },
    lastSync: Date,
    connectedAt: Date,
}, baseSchemaOptions);

wearableDeviceSchema.index({ userId: 1 });
wearableDeviceSchema.index({ userId: 1, connected: 1 });

const fitnessDataSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    steps: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    heartRate: { type: Number, default: 0 },
    activeMinutes: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    sleep: { type: Number, default: 0 },
    deviceId: { type: Schema.Types.ObjectId, ref: 'WearableDevice' },
}, baseSchemaOptions);

fitnessDataSchema.index({ userId: 1, date: -1 });
fitnessDataSchema.index({ userId: 1, date: 1 }, { unique: true });

const fitnessGoalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['steps', 'calories', 'distance', 'activeMinutes', 'sleep', 'heartRate', 'weight'], required: true },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    unit: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
}, baseSchemaOptions);

fitnessGoalSchema.index({ userId: 1 });
fitnessGoalSchema.index({ userId: 1, type: 1 });

const WearableDevice = model('WearableDevice', wearableDeviceSchema);
const FitnessData = model('FitnessData', fitnessDataSchema);
const FitnessGoal = model('FitnessGoal', fitnessGoalSchema);

export default WearableDevice;
export { WearableDevice, FitnessData, FitnessGoal };
