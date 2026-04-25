import { Request } from 'express';
import { WaitlistService } from './waitlist.service';
import {
    ICreateWaitlistEntryRequest,
    IWaitlistFilters,
    WaitlistPriority,
} from './waitlist.interface';

/**
 * WaitlistController
 *
 * Plain Express-style controller. Each handler returns a response payload
 * object; the route layer is responsible for sending it via `res.json(...)`.
 * This matches the shape the existing `waitlist.routes.ts` expects.
 */
export class WaitlistController {
    private waitlistService: WaitlistService;

    constructor(waitlistService?: WaitlistService) {
        // Allow injection for testing; default to a fresh instance.
        this.waitlistService = waitlistService ?? new WaitlistService();
    }

    /**
     * Add student to waitlist
     */
    async createWaitlistEntry(
        body: ICreateWaitlistEntryRequest,
        req: Request
    ): Promise<{ success: boolean; message: string; data: any }> {
        const userId = req.user?.id || 'system';
        const entry = await this.waitlistService.createWaitlistEntry(body, userId);
        return {
            success: true,
            message: 'Student added to waitlist successfully',
            data: entry,
        };
    }

    /**
     * Get waitlist entries for location
     */
    async getLocationWaitlist(
        locationId: string,
        filters: IWaitlistFilters | any
    ): Promise<{ success: boolean; message: string; data: any }> {
        const entries = await this.waitlistService.getLocationWaitlist(locationId, filters);
        return {
            success: true,
            message: 'Waitlist entries retrieved successfully',
            data: entries,
        };
    }

    /**
     * Get waitlist entries for a specific class
     */
    async getClassWaitlist(
        classId: string,
        filters: any
    ): Promise<{ success: boolean; message: string; data: any }> {
        const entries = await this.waitlistService.getClassWaitlist(classId, filters);
        return {
            success: true,
            message: 'Class waitlist retrieved successfully',
            data: entries,
        };
    }

    /**
     * Get waitlist entries for a student
     */
    async getStudentWaitlist(
        studentId: string
    ): Promise<{ success: boolean; message: string; data: any }> {
        const entries = await this.waitlistService.getStudentWaitlist(studentId);
        return {
            success: true,
            message: 'Student waitlist entries retrieved successfully',
            data: entries,
        };
    }

    /**
     * Get single waitlist entry details
     */
    async getWaitlistEntry(
        entryId: string
    ): Promise<{ success: boolean; message: string; data: any }> {
        const entry = await this.waitlistService.getWaitlistEntry(entryId);
        return {
            success: true,
            message: 'Waitlist entry retrieved successfully',
            data: entry,
        };
    }

    /**
     * Update waitlist entry priority
     */
    async updatePriority(
        entryId: string,
        priority: WaitlistPriority
    ): Promise<{ success: boolean; message: string; data: any }> {
        // updatedBy will default to 'system' when no authenticated context is
        // passed through — routes can enrich this later if needed.
        const entry = await this.waitlistService.updatePriority(entryId, priority, 'system');
        return {
            success: true,
            message: 'Waitlist priority updated successfully',
            data: entry,
        };
    }

    /**
     * Offer spot to waitlisted student
     */
    async offerSpot(
        entryId: string,
        req: Request
    ): Promise<{ success: boolean; message: string; data: any }> {
        const userId = req.user?.id || 'system';
        const entry = await this.waitlistService.offerSpot(entryId, userId);
        return {
            success: true,
            message: 'Spot offered successfully',
            data: entry,
        };
    }

    /**
     * Accept waitlist offer
     */
    async acceptOffer(
        entryId: string
    ): Promise<{ success: boolean; message: string; data: any }> {
        const entry = await this.waitlistService.acceptOffer(entryId);
        return {
            success: true,
            message: 'Offer accepted successfully',
            data: entry,
        };
    }

    /**
     * Reject waitlist offer
     */
    async rejectOffer(
        entryId: string,
        body: { reason?: string }
    ): Promise<{ success: boolean; message: string; data: any }> {
        const entry = await this.waitlistService.rejectOffer(entryId, body?.reason);
        return {
            success: true,
            message: 'Offer rejected successfully',
            data: entry,
        };
    }

    /**
     * Remove from waitlist
     */
    async removeFromWaitlist(
        entryId: string,
        req: Request
    ): Promise<{ success: boolean; message: string }> {
        const userId = req.user?.id || 'system';
        await this.waitlistService.removeFromWaitlist(entryId, userId);
        return {
            success: true,
            message: 'Removed from waitlist successfully',
        };
    }
}

export default WaitlistController;
