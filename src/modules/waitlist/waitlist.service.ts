import { Model } from 'mongoose';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { WaitlistEntry } from './waitlist.model';
import {
    IWaitlistEntry,
    ICreateWaitlistEntryRequest,
    IUpdateWaitlistEntryRequest,
    WaitlistStatus,
    WaitlistPriority
} from './waitlist.interface';

export class WaitlistService {
    private waitlistModel: Model<IWaitlistEntry>;

    constructor(waitlistModel: Model<IWaitlistEntry>) {
        this.waitlistModel = waitlistModel;
    }

    /**
     * Create waitlist entry
     */
    async createWaitlistEntry(entryRequest: ICreateWaitlistEntryRequest, createdBy: string): Promise<IWaitlistEntry> {
        try {
            // Get current position in waitlist for the class
            const position = await this.getNextPosition(entryRequest.classId);

            const entry = new this.waitlistModel({
                ...entryRequest,
                position,
                status: WaitlistStatus.ACTIVE,
                joinedDate: new Date(),
                businessUnitId: await this.getBusinessUnitId(entryRequest.studentId),
                createdBy,
                updatedBy: createdBy
            });

            await entry.save();
            return entry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create waitlist entry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get waitlist entries for a location
     */
    async getLocationWaitlist(locationId: string, filters?: any): Promise<IWaitlistEntry[]> {
        try {
            const query: any = { businessUnitId: locationId };

            if (filters?.status) {
                query.status = filters.status;
            }

            if (filters?.classId) {
                query.classId = filters.classId;
            }

            return await this.waitlistModel
                .find(query)
                .populate('studentId', 'firstName lastName')
                .populate('classId', 'name schedule')
                .sort({ position: 1, joinedDate: 1 })
                .exec();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to fetch waitlist entries',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get waitlist entries for a specific class
     */
    async getClassWaitlist(classId: string, filters?: any): Promise<IWaitlistEntry[]> {
        try {
            const query: any = { classId };

            if (filters?.status) {
                query.status = filters.status;
            }

            if (filters?.priority) {
                query.priority = filters.priority;
            }

            const limit = filters?.limit ? parseInt(filters.limit) : 50;
            const offset = filters?.offset ? parseInt(filters.offset) : 0;
            const sortBy = filters?.sortBy || 'position';
            const sortOrder = filters?.sortOrder === 'desc' ? -1 : 1;

            return await this.waitlistModel
                .find(query)
                .populate('studentId', 'firstName lastName email')
                .populate('classId', 'name schedule')
                .sort({ [sortBy]: sortOrder })
                .limit(limit)
                .skip(offset)
                .exec();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to fetch class waitlist',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get waitlist entries for a student
     */
    async getStudentWaitlist(studentId: string): Promise<IWaitlistEntry[]> {
        try {
            return await this.waitlistModel
                .find({ studentId })
                .populate('classId', 'name schedule')
                .populate('businessUnitId', 'name')
                .sort({ createdAt: -1 })
                .exec();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to fetch student waitlist entries',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get single waitlist entry
     */
    async getWaitlistEntry(entryId: string): Promise<IWaitlistEntry> {
        try {
            const entry = await this.waitlistModel
                .findById(entryId)
                .populate('studentId')
                .populate('classId')
                .populate('businessUnitId')
                .exec();

            if (!entry) {
                throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
            }

            return entry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to fetch waitlist entry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Offer spot to waitlist entry
     */
    async offerSpot(entryId: string, offeredBy: string): Promise<IWaitlistEntry> {
        try {
            const entry = await this.waitlistModel.findById(entryId);
            if (!entry) {
                throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
            }

            if (entry.status !== WaitlistStatus.ACTIVE) {
                throw new AppError('Can only offer spots to active waitlist entries', HTTP_STATUS.BAD_REQUEST);
            }

            entry.status = WaitlistStatus.OFFERED;
            entry.offerDate = new Date();
            entry.offerExpiryDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
            entry.updatedBy = offeredBy;

            await entry.save();

            // Send notification to parent
            await this.sendOfferNotification(entry);

            return entry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to offer spot',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Accept waitlist offer
     */
    async acceptOffer(entryId: string): Promise<IWaitlistEntry> {
        try {
            const entry = await this.waitlistModel.findById(entryId);
            if (!entry) {
                throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
            }

            if (entry.status !== WaitlistStatus.OFFERED) {
                throw new AppError('No active offer found', HTTP_STATUS.BAD_REQUEST);
            }

            if (entry.offerExpiryDate && entry.offerExpiryDate < new Date()) {
                throw new AppError('Offer has expired', HTTP_STATUS.BAD_REQUEST);
            }

            entry.status = WaitlistStatus.ENROLLED;
            entry.enrolledDate = new Date();

            await entry.save();

            // Create actual enrollment
            await this.createEnrollment(entry);

            // Move up remaining waitlist positions
            await this.updateWaitlistPositions(entry.classId.toString(), entry.position);

            return entry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to accept offer',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Reject waitlist offer
     */
    async rejectOffer(entryId: string, reason?: string): Promise<IWaitlistEntry> {
        try {
            const entry = await this.waitlistModel.findById(entryId);
            if (!entry) {
                throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
            }

            if (entry.status !== WaitlistStatus.OFFERED) {
                throw new AppError('No active offer to reject', HTTP_STATUS.BAD_REQUEST);
            }

            entry.status = WaitlistStatus.ACTIVE;
            entry.rejectionReason = reason;
            entry.rejectionDate = new Date();
            entry.offerDate = undefined;
            entry.offerExpiryDate = undefined;

            await entry.save();

            return entry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to reject offer',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update waitlist entry priority
     */
    async updatePriority(entryId: string, priority: string): Promise<IWaitlistEntry> {
        try {
            if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
                throw new AppError('Invalid priority value', HTTP_STATUS.BAD_REQUEST);
            }

            const entry = await this.waitlistModel.findByIdAndUpdate(
                entryId,
                { priority },
                { new: true }
            );

            if (!entry) {
                throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
            }

            return entry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update priority',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove from waitlist
     */
    async removeFromWaitlist(entryId: string, removedBy: string): Promise<void> {
        try {
            const entry = await this.waitlistModel.findById(entryId);
            if (!entry) {
                throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
            }

            const position = entry.position;
            const classId = entry.classId.toString();

            await this.waitlistModel.findByIdAndDelete(entryId);

            // Update positions for remaining entries
            await this.updateWaitlistPositions(classId, position);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to remove from waitlist',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get next position in waitlist
     */
    private async getNextPosition(classId: string): Promise<number> {
        const lastEntry = await this.waitlistModel
            .findOne({ classId })
            .sort({ position: -1 })
            .exec();

        return lastEntry ? lastEntry.position + 1 : 1;
    }

    /**
     * Update waitlist positions after removal
     */
    private async updateWaitlistPositions(classId: string, removedPosition: number): Promise<void> {
        await this.waitlistModel.updateMany(
            { classId, position: { $gt: removedPosition } },
            { $inc: { position: -1 } }
        );
    }

    /**
     * Send offer notification
     */
    private async sendOfferNotification(entry: IWaitlistEntry): Promise<void> {
        // Implementation would send email/SMS notification
        console.log(`Sending offer notification for waitlist entry ${entry._id}`);
    }

    /**
     * Create enrollment from waitlist
     */
    private async createEnrollment(entry: IWaitlistEntry): Promise<void> {
        // Implementation would create actual class enrollment
        console.log(`Creating enrollment for waitlist entry ${entry._id}`);
    }

    /**
     * Get business unit ID for student
     */
    private async getBusinessUnitId(studentId: string): Promise<string> {
        // Implementation would fetch student's business unit
        return 'default-location-id';
    }
}
