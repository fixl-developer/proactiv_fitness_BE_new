import { SupportTicket, ISupportTicket } from './support.model';
import { emailNotificationService } from './email-notification.service';
import { ticketHistoryService } from './ticket-history.service';

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
}

export class TicketAssignmentService {
    async assignTicket(
        ticketId: string,
        staffId: string,
        staffName: string,
        staffEmail: string,
        assignedBy: string,
        assignedByEmail: string
    ): Promise<ISupportTicket | null> {
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) return null;

        const oldAssignedTo = ticket.assignedTo;

        // Update ticket
        const updated = await SupportTicket.findByIdAndUpdate(
            ticketId,
            {
                assignedTo: staffId,
                assignedToName: staffName,
                assignedToEmail: staffEmail,
                assignedAt: new Date(),
                updatedBy: assignedBy,
            },
            { new: true }
        );

        // Record history
        await ticketHistoryService.recordChange(
            ticketId,
            'assignment',
            'assignedTo',
            oldAssignedTo || 'unassigned',
            staffId,
            assignedBy,
            assignedByEmail,
            `Assigned to ${staffName}`
        );

        // Send notification to staff
        await emailNotificationService.sendTicketAssignedEmail(
            ticket.ticketId,
            staffEmail,
            staffName,
            ticket.subject,
            ticket.customer.name
        );

        return updated;
    }

    async reassignTicket(
        ticketId: string,
        newStaffId: string,
        newStaffName: string,
        newStaffEmail: string,
        reassignedBy: string,
        reassignedByEmail: string,
        reason?: string
    ): Promise<ISupportTicket | null> {
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) return null;

        const oldAssignedTo = ticket.assignedTo;
        const oldAssignedToName = ticket.assignedToName;

        // Update ticket
        const updated = await SupportTicket.findByIdAndUpdate(
            ticketId,
            {
                assignedTo: newStaffId,
                assignedToName: newStaffName,
                assignedToEmail: newStaffEmail,
                assignedAt: new Date(),
                updatedBy: reassignedBy,
            },
            { new: true }
        );

        // Record history
        await ticketHistoryService.recordChange(
            ticketId,
            'assignment',
            'assignedTo',
            `${oldAssignedToName} (${oldAssignedTo})`,
            `${newStaffName} (${newStaffId})`,
            reassignedBy,
            reassignedByEmail,
            reason || `Reassigned from ${oldAssignedToName} to ${newStaffName}`
        );

        // Send notification to new staff
        await emailNotificationService.sendTicketAssignedEmail(
            ticket.ticketId,
            newStaffEmail,
            newStaffName,
            ticket.subject,
            ticket.customer.name
        );

        return updated;
    }

    async unassignTicket(ticketId: string, unassignedBy: string, unassignedByEmail: string): Promise<ISupportTicket | null> {
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) return null;

        const oldAssignedTo = ticket.assignedTo;
        const oldAssignedToName = ticket.assignedToName;

        // Update ticket
        const updated = await SupportTicket.findByIdAndUpdate(
            ticketId,
            {
                assignedTo: undefined,
                assignedToName: undefined,
                assignedToEmail: undefined,
                assignedAt: undefined,
                updatedBy: unassignedBy,
            },
            { new: true }
        );

        // Record history
        await ticketHistoryService.recordChange(
            ticketId,
            'assignment',
            'assignedTo',
            `${oldAssignedToName} (${oldAssignedTo})`,
            'unassigned',
            unassignedBy,
            unassignedByEmail,
            `Unassigned from ${oldAssignedToName}`
        );

        return updated;
    }

    async getAssignedTickets(staffId: string, status?: string, limit: number = 50, page: number = 1): Promise<{ tickets: ISupportTicket[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter: any = { assignedTo: staffId };

        if (status) {
            filter.status = status;
        }

        const [tickets, total] = await Promise.all([
            SupportTicket.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SupportTicket.countDocuments(filter),
        ]);

        return { tickets, total };
    }

    async getStaffWorkload(staffId: string): Promise<{ open: number; inProgress: number; pending: number; total: number }> {
        const [open, inProgress, pending, total] = await Promise.all([
            SupportTicket.countDocuments({ assignedTo: staffId, status: 'open' }),
            SupportTicket.countDocuments({ assignedTo: staffId, status: 'in-progress' }),
            SupportTicket.countDocuments({ assignedTo: staffId, status: 'pending' }),
            SupportTicket.countDocuments({ assignedTo: staffId }),
        ]);

        return { open, inProgress, pending, total };
    }

    async getUnassignedTickets(limit: number = 50, page: number = 1): Promise<{ tickets: ISupportTicket[]; total: number }> {
        const skip = (page - 1) * limit;
        const [tickets, total] = await Promise.all([
            SupportTicket.find({ assignedTo: { $exists: false } })
                .sort({ priority: -1, createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SupportTicket.countDocuments({ assignedTo: { $exists: false } }),
        ]);

        return { tickets, total };
    }
}

export const ticketAssignmentService = new TicketAssignmentService();
