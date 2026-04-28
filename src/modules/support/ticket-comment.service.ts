import { TicketComment, ITicketComment, SupportTicket } from './support.model';
import { emailNotificationService } from './email-notification.service';

export class TicketCommentService {
    async addComment(
        ticketId: string,
        userId: string,
        userName: string,
        userEmail: string,
        userType: 'staff' | 'customer' | 'system',
        message: string,
        isInternal: boolean = false,
        attachments: any[] = []
    ): Promise<ITicketComment> {
        const comment = await TicketComment.create({
            commentId: `CMT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            ticketId,
            userId,
            userName,
            userEmail,
            userType,
            message,
            isInternal,
            attachments,
        });

        // Update ticket's comments array
        await SupportTicket.findByIdAndUpdate(
            ticketId,
            {
                $push: {
                    comments: {
                        commentId: comment.commentId,
                        author: userName,
                        authorType: userType,
                        message,
                        isInternal,
                        createdAt: new Date(),
                    },
                },
            },
            { new: true }
        );

        // Send notifications
        const ticket = await SupportTicket.findById(ticketId);
        if (ticket) {
            // Notify customer if staff commented
            if (userType === 'staff' && !isInternal) {
                await emailNotificationService.sendCommentAddedEmail(
                    ticket.ticketId,
                    ticket.customer.email,
                    ticket.customer.name,
                    userName,
                    message,
                    false
                );
            }

            // Notify assigned staff if customer commented
            if (userType === 'customer' && ticket.assignedToEmail) {
                await emailNotificationService.sendCommentAddedEmail(
                    ticket.ticketId,
                    ticket.assignedToEmail,
                    ticket.assignedToName || 'Staff Member',
                    userName,
                    message,
                    false
                );
            }
        }

        return comment;
    }

    async getTicketComments(ticketId: string, limit: number = 100, page: number = 1): Promise<{ comments: ITicketComment[]; total: number }> {
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            TicketComment.find({ ticketId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            TicketComment.countDocuments({ ticketId }),
        ]);

        return { comments, total };
    }

    async deleteComment(commentId: string, ticketId: string): Promise<void> {
        await TicketComment.findByIdAndDelete(commentId);

        // Remove from ticket's comments array
        await SupportTicket.findByIdAndUpdate(
            ticketId,
            {
                $pull: {
                    comments: { commentId },
                },
            }
        );
    }

    async updateComment(commentId: string, message: string): Promise<ITicketComment | null> {
        return TicketComment.findByIdAndUpdate(
            commentId,
            { message, updatedAt: new Date() },
            { new: true }
        );
    }

    async getCommentsByUser(userId: string, limit: number = 50): Promise<ITicketComment[]> {
        return TicketComment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    async deleteTicketComments(ticketId: string): Promise<void> {
        await TicketComment.deleteMany({ ticketId });
    }
}

export const ticketCommentService = new TicketCommentService();
