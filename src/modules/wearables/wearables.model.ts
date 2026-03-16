import { Schema, model } from 'mongoose';

const wearableDeviceSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceType: { type: String, enum: ['fitbit', 'apple-watch', 'garmin', 'samsung', 'other'], required: true },
    deviceName: String,
    connected: { type: Boolean, default: false },
    lastSync: Date,
    connectedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

wearableDeviceSchema.index({ userId: 1 });
wearableDeviceSchema.index({ connected: 1 });

export default model('WearableDevice', wearableDeviceSchema);
