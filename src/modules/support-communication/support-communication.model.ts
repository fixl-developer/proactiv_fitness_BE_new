import { Schema, model, Document } from 'mongoose';

export interface IStaffAnnouncement extends Document {
    announcementId: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    author: string;
    authorId: string;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const StaffAnnouncementSchema = new Schema<IStaffAnnouncement>({
    announcementId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const StaffAnnouncement = model<IStaffAnnouncement>('StaffAnnouncement', StaffAnnouncementSchema);

export interface IStaffTeamMessage extends Document {
    messageId: string;
    subject: string;
    content: string;
    sender: string;
    senderId: string;
    recipients: string;
    priority: 'low' | 'medium' | 'high';
    read: boolean;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const StaffTeamMessageSchema = new Schema<IStaffTeamMessage>({
    messageId: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    sender: { type: String, required: true },
    senderId: { type: String, required: true },
    recipients: { type: String, default: 'all' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export const StaffTeamMessage = model<IStaffTeamMessage>('StaffTeamMessage', StaffTeamMessageSchema);
