import VirtualClass from './virtual-training.model';
import logger from '@/utils/logger';

class VirtualTrainingService {
    async getVirtualClasses(filters: any) {
        const query: any = {};
        if (filters.status) query.status = filters.status;
        const classes = await VirtualClass.find(query).limit(filters.limit || 20).skip(filters.skip || 0).lean();
        const total = await VirtualClass.countDocuments(query);
        return { data: classes, total };
    }

    async getVirtualClassById(classId: string) {
        const virtualClass = await VirtualClass.findById(classId).lean();
        if (!virtualClass) throw new Error('Virtual class not found');
        return virtualClass;
    }

    async createVirtualClass(data: any) {
        const virtualClass = new VirtualClass(data);
        await virtualClass.save();
        logger.info(`Virtual class created: ${virtualClass._id}`);
        return virtualClass;
    }

    async updateVirtualClass(classId: string, data: any) {
        const virtualClass = await VirtualClass.findByIdAndUpdate(classId, data, { new: true });
        if (!virtualClass) throw new Error('Virtual class not found');
        logger.info(`Virtual class updated: ${classId}`);
        return virtualClass;
    }

    async cancelVirtualClass(classId: string) {
        const virtualClass = await VirtualClass.findByIdAndUpdate(classId, { status: 'cancelled' }, { new: true });
        if (!virtualClass) throw new Error('Virtual class not found');
        logger.info(`Virtual class cancelled: ${classId}`);
        return virtualClass;
    }

    async joinVirtualClass(classId: string, userId: string) {
        const virtualClass = await VirtualClass.findByIdAndUpdate(
            classId,
            { $inc: { currentParticipants: 1 }, $push: { participants: userId } },
            { new: true }
        );
        logger.info(`User ${userId} joined class ${classId}`);
        return { joinUrl: `https://stream.example.com/join/${classId}`, sessionId: `session-${Date.now()}` };
    }

    async leaveVirtualClass(classId: string, userId: string) {
        await VirtualClass.findByIdAndUpdate(
            classId,
            { $inc: { currentParticipants: -1 }, $pull: { participants: userId } }
        );
        logger.info(`User ${userId} left class ${classId}`);
    }

    async getRecordings(filters: any) {
        const query = { status: 'completed', recordingUrl: { $exists: true } };
        const recordings = await VirtualClass.find(query).limit(filters.limit || 20).skip(filters.skip || 0).lean();
        return recordings;
    }

    async getRecordingById(recordingId: string) {
        const recording = await VirtualClass.findById(recordingId).lean();
        if (!recording) throw new Error('Recording not found');
        return recording;
    }

    async sendMessage(classId: string, userId: string, message: string) {
        logger.info(`Message sent in class ${classId} by user ${userId}`);
        return { success: true };
    }

    async getMessages(classId: string) {
        return [];
    }

    async getAttendance(classId: string) {
        const virtualClass = await VirtualClass.findById(classId).lean();
        return virtualClass?.participants || [];
    }
}

export default new VirtualTrainingService();
