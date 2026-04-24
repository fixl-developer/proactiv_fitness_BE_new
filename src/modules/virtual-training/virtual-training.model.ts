import { Schema, model } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, excludeDeleted } from '../../shared/base/base.model';

const virtualClassSchema = new Schema({
    ...baseSchemaFields,
    title: { type: String, required: true },
    description: String,
    coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    maxParticipants: { type: Number, default: 50 },
    currentParticipants: { type: Number, default: 0 },
    status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
    streamUrl: String,
    recordingUrl: String,
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, baseSchemaOptions);

virtualClassSchema.index({ coachId: 1 });
virtualClassSchema.index({ locationId: 1 });
virtualClassSchema.index({ status: 1 });
virtualClassSchema.index({ scheduledAt: 1 });

virtualClassSchema.pre('find', excludeDeleted);
virtualClassSchema.pre('findOne', excludeDeleted);
virtualClassSchema.pre('countDocuments', excludeDeleted);

const virtualMessageSchema = new Schema({
    ...baseSchemaFields,
    sessionId: { type: Schema.Types.ObjectId, ref: 'VirtualClass', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'system', 'emoji'], default: 'text' },
}, baseSchemaOptions);

virtualMessageSchema.index({ sessionId: 1, createdAt: 1 });
virtualMessageSchema.pre('find', excludeDeleted);
virtualMessageSchema.pre('findOne', excludeDeleted);

const VirtualClass = model('VirtualClass', virtualClassSchema);
const VirtualMessage = model('VirtualMessage', virtualMessageSchema);

export default VirtualClass;
export { VirtualMessage };
