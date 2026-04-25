import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { WaitlistEntry } from './waitlist.model';
import {
    IWaitlistEntry,
    ICreateWaitlistEntryRequest,
    IUpdateWaitlistEntryRequest,
    WaitlistStatus,
    WaitlistPriority,
} from './waitlist.interface';

export class WaitlistService extends BaseService<IWaitlistEntry> {
    constructor() {
        super(WaitlistEntry as any, 'waitlist');
    }

    /**
     * Create waitlist entry
     */
    async createWaitlistEntry(
        entryRequest: ICreateWaitlistEntryRequest,
        createdBy: string
    ): Promise<IWaitlistEntry> {
        try {
            const position = await this.getNextPosition(entryRequest.classId);

            const entry = new WaitlistEntry({
                ...entryRequest,
                position,
                status: WaitlistStatus.ACTIVE,
                joinedDate: new Date(),
                businessUnitId: await this.getBusinessUnitId(entryRequest.studentId),
                createdBy,
                updatedBy: createdBy,
            });

            await entry.save();
            return entry;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
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

            if (filters?.priority) {
                query.priority = filters.priority;
            }

            return await WaitlistEntry.find(query)
                .populate('studentId', 'firstName lastName')
                .populate('classId', 'name schedule')
                .sort({ position: 1, joinedDate: 1 })
                .exec();
        } catch (error: any) {
            if (error instanceof AppError) throw error;
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
            if (filters?.status) query.status = filters.status;

            return await WaitlistEntry.find(query)
                .populate('studentId', 'firstName lastName')
                .sort({ position: 1 })
                .exec();
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                error.message || 'Failed to fetch class waitlist',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get all waitlist entries for a student
     */
    async getStudentWaitlist(studentId: string): Promise<IWaitlistEntry[]> {
        try {
            return await WaitlistEntry.find({ studentId })
                .populate('classId', 'name schedule')
                .sort({ createdAt: -1 })
                .exec();
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                error.message || 'Failed to fetch student waitlist entries',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get waitlist entry by id
     */
    async getWaitlistEntry(entryId: string): Promise<IWaitlistEntry> {
        const entry = await WaitlistEntry.findById(entryId)
            .populate('studentId', 'firstName lastName')
            .populate('classId', 'name schedule')
            .exec();
        if (!entry) {
            throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
        }
        return entry;
    }

    /**
     * Update waitlist entry priority
     */
    async updatePriority(
        entryId: string,
        priority: WaitlistPriority,
        updatedBy: string
    ): Promise<IWaitlistEntry> {
        const entry = await WaitlistEntry.findById(entryId);
        if (!entry) {
            throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
        }
        entry.priority = priority;
        entry.updatedBy = updatedBy;
        await entry.save();
        return entry;
    }

    /**
     * Offer spot to waitlist entry
     */
    async offerSpot(entryId: string, offeredBy: string): Promise<IWaitlistEntry> {
        const entry = await WaitlistEntry.findById(entryId);
        if (!entry) {
            throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
        }

        if (entry.status !== WaitlistStatus.ACTIVE) {
            throw new AppError(
                'Can only offer spots to active waitlist entries',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        entry.status = WaitlistStatus.OFFERED;
        entry.offerDate = new Date();
        entry.offerExpiryDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
        entry.updatedBy = offeredBy;

        await entry.save();
        await this.sendOfferNotification(entry);

        return entry;
    }

    /**
     * Accept waitlist offer
     */
    async acceptOffer(entryId: string): Promise<IWaitlistEntry> {
        const entry = await WaitlistEntry.findById(entryId);
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
        await this.updateWaitlistPositions(String(entry.classId), entry.position);

        return entry;
    }

    /**
     * Reject waitlist offer
     */
    async rejectOffer(
        entryId: string,
        reason?: string,
        rejectedBy?: string
    ): Promise<IWaitlistEntry> {
        const entry = await WaitlistEntry.findById(entryId);
        if (!entry) {
            throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
        }

        if (entry.status !== WaitlistStatus.OFFERED) {
            throw new AppError('No active offer to reject', HTTP_STATUS.BAD_REQUEST);
        }

        entry.status = WaitlistStatus.CANCELLED;
        if (reason) {
            entry.notes = entry.notes
                ? `${entry.notes} | Rejected: ${reason}`
                : `Rejected: ${reason}`;
        }
        if (rejectedBy) {
            entry.updatedBy = rejectedBy;
        }

        await entry.save();

        // Move up remaining waitlist positions since this spot is now free
        await this.updateWaitlistPositions(String(entry.classId), entry.position);

        return entry;
    }

    /**
     * Remove from waitlist
     */
    async removeFromWaitlist(entryId: string, _removedBy: string): Promise<void> {
        const entry = await WaitlistEntry.findById(entryId);
        if (!entry) {
            throw new AppError('Waitlist entry not found', HTTP_STATUS.NOT_FOUND);
        }

        const position = entry.position;
        const classId = String(entry.classId);

        await WaitlistEntry.findByIdAndDelete(entryId);

        // Update positions for remaining entries
        await this.updateWaitlistPositions(classId, position);
    }

    /**
     * Get next position in waitlist
     */
    private async getNextPosition(classId: string): Promise<number> {
        const lastEntry = await WaitlistEntry.findOne({ classId })
            .sort({ position: -1 })
            .exec();

        return lastEntry ? lastEntry.position + 1 : 1;
    }

    /**
     * Update waitlist positions after removal
     */
    private async updateWaitlistPositions(
        classId: string,
        removedPosition: number
    ): Promise<void> {
        await WaitlistEntry.updateMany(
            { classId, position: { $gt: removedPosition } },
            { $inc: { position: -1 } }
        );
    }

    /**
     * Send offer notification (stub — integrate with notification service later)
     */
    private async sendOfferNotification(entry: IWaitlistEntry): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(`Sending offer notification for waitlist entry ${entry._id}`);
    }

    /**
     * Create enrollment from waitlist (stub — integrate with enrollment service later)
     */
    private async createEnrollment(entry: IWaitlistEntry): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(`Creating enrollment for waitlist entry ${entry._id}`);
    }

    /**
     * Get business unit ID for a student (stub — integrate with student service later)
     */
    private async getBusinessUnitId(_studentId: string): Promise<string> {
        return 'default-location-id';
    }
}

// Default export for convenience
export default WaitlistService;
