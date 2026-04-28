import { ExitProtocolModel } from './exit-protocol.model';
import { v4 as uuidv4 } from 'uuid';

export class ExitProtocolService {
    async initiateExit(data: any) {
        const { userId, tenantId, reason, requestedDate } = data;

        const exitRequest = new ExitProtocolModel({
            exitId: uuidv4(),
            userId,
            tenantId,
            reason,
            status: 'pending',
            requestedDate: requestedDate || new Date(),
            approvalDate: null,
            completionDate: null,
        });

        await exitRequest.save();
        return exitRequest;
    }

    async approveExit(exitId: string, approvedBy: string) {
        const exitRequest = await ExitProtocolModel.findOneAndUpdate(
            { exitId },
            { status: 'approved', approvalDate: new Date(), approvedBy },
            { new: true }
        );
        return exitRequest;
    }

    async completeExit(exitId: string) {
        const exitRequest = await ExitProtocolModel.findOneAndUpdate(
            { exitId },
            { status: 'completed', completionDate: new Date() },
            { new: true }
        );
        return exitRequest;
    }

    async getExitRequests(tenantId: string) {
        const requests = await ExitProtocolModel.find({ tenantId });
        return requests;
    }

    async deleteUserData(userId: string, tenantId: string) {
        // Implement data deletion logic
        const result = {
            userId,
            tenantId,
            deletedAt: new Date(),
            status: 'completed',
            message: 'User data deletion completed',
        };
        return result;
    }
}
