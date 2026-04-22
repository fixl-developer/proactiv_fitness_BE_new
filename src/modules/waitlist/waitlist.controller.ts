import { WaitlistService } from './waitlist.service';
import {
    ICreateWaitlistEntryRequest,
    IUpdateWaitlistEntryRequest,
    IWaitlistFilters
} from './waitlist.interface';

export class WaitlistController {
    constructor(private readonly waitlistService: WaitlistService) { }

    async createWaitlistEntry(
        createRequest: ICreateWaitlistEntryRequest,
        req: any
    ) {
        const entry = await this.waitlistService.createWaitlistEntry(createRequest, req.user.id);
        return {
            success: true,
            message: 'Student added to waitlist successfully',
            data: entry
        };
    }

    async getLocationWaitlist(
        locationId: string,
        filters: IWaitlistFilters
    ) {
        const entries = await this.waitlistService.getLocationWaitlist(locationId, filters);
        return {
            success: true,
            message: 'Waitlist entries retrieved successfully',
            data: entries
        };
    }

    async getClassWaitlist(
        classId: string,
        filters: IWaitlistFilters
    ) {
        const entries = await this.waitlistService.getClassWaitlist(classId, filters);
        return {
            success: true,
            message: 'Class waitlist retrieved successfully',
            data: entries
        };
    }

    async getStudentWaitlist(studentId: string) {
        const entries = await this.waitlistService.getStudentWaitlist(studentId);
        return {
            success: true,
            message: 'Student waitlist retrieved successfully',
            data: entries
        };
    }

    async getWaitlistEntry(entryId: string) {
        const entry = await this.waitlistService.getWaitlistEntry(entryId);
        return {
            success: true,
            message: 'Waitlist entry retrieved successfully',
            data: entry
        };
    }

    async offerSpot(
        entryId: string,
        req: any
    ) {
        const entry = await this.waitlistService.offerSpot(entryId, req.user.id);
        return {
            success: true,
            message: 'Spot offered successfully',
            data: entry
        };
    }

    async acceptOffer(entryId: string) {
        const entry = await this.waitlistService.acceptOffer(entryId);
        return {
            success: true,
            message: 'Offer accepted successfully',
            data: entry
        };
    }

    async rejectOffer(
        entryId: string,
        body: any
    ) {
        const entry = await this.waitlistService.rejectOffer(entryId, body.reason);
        return {
            success: true,
            message: 'Offer rejected successfully',
            data: entry
        };
    }

    async updatePriority(
        entryId: string,
        body: { priority: string }
    ) {
        const entry = await this.waitlistService.updatePriority(entryId, body.priority);
        return {
            success: true,
            message: 'Priority updated successfully',
            data: entry
        };
    }

    async removeFromWaitlist(
        entryId: string,
        req: any
    ) {
        await this.waitlistService.removeFromWaitlist(entryId, req.user.id);
        return {
            success: true,
            message: 'Removed from waitlist successfully'
        };
    }
}
