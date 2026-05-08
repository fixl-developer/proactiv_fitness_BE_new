import { StaffAnnouncement, StaffTeamMessage, IStaffAnnouncement, IStaffTeamMessage } from './support-communication.model';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class SupportCommunicationService {
    // Announcements
    async listAnnouncements(): Promise<IStaffAnnouncement[]> {
        return StaffAnnouncement.find().sort({ publishedAt: -1 }).lean() as any;
    }

    async createAnnouncement(data: Partial<IStaffAnnouncement>, author: string, authorId: string): Promise<IStaffAnnouncement> {
        if (!data.title || !data.content) {
            throw new AppError('title and content are required', HTTP_STATUS.BAD_REQUEST);
        }
        const announcementId = `ANN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return StaffAnnouncement.create({
            announcementId,
            title: data.title,
            content: data.content,
            priority: data.priority || 'low',
            author,
            authorId,
        });
    }

    async deleteAnnouncement(announcementId: string): Promise<void> {
        const result = await StaffAnnouncement.deleteOne({ announcementId });
        if (result.deletedCount === 0) throw new AppError('Announcement not found', HTTP_STATUS.NOT_FOUND);
    }

    // Team Messages
    async listMessages(): Promise<IStaffTeamMessage[]> {
        return StaffTeamMessage.find().sort({ timestamp: -1 }).lean() as any;
    }

    async sendMessage(data: any, sender: string, senderId: string): Promise<IStaffTeamMessage> {
        if (!data.subject || !(data.message || data.content)) {
            throw new AppError('subject and message are required', HTTP_STATUS.BAD_REQUEST);
        }
        const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return StaffTeamMessage.create({
            messageId,
            subject: data.subject,
            content: data.message || data.content,
            sender,
            senderId,
            recipients: data.recipients || 'all',
            priority: data.priority || 'low',
            read: false,
        });
    }

    async markMessageRead(messageId: string): Promise<IStaffTeamMessage> {
        const msg = await StaffTeamMessage.findOneAndUpdate(
            { messageId },
            { read: true },
            { new: true }
        );
        if (!msg) throw new AppError('Message not found', HTTP_STATUS.NOT_FOUND);
        return msg;
    }

    async deleteMessage(messageId: string): Promise<void> {
        const result = await StaffTeamMessage.deleteOne({ messageId });
        if (result.deletedCount === 0) throw new AppError('Message not found', HTTP_STATUS.NOT_FOUND);
    }
}
