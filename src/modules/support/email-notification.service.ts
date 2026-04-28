import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    cc?: string[];
    bcc?: string[];
}

export class EmailNotificationService {
    private transporter: any;

    constructor() {
        // Configure nodemailer with your email service
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendTicketCreatedEmail(ticketId: string, customerEmail: string, subject: string, customerName: string): Promise<void> {
        const html = `
            <h2>Support Ticket Created</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for contacting us. Your support ticket has been created successfully.</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p>Our support team will review your request and get back to you as soon as possible.</p>
            <p>You can track your ticket status at any time by logging into your account.</p>
            <p>Best regards,<br/>Support Team</p>
        `;

        await this.sendEmail({
            to: customerEmail,
            subject: `Ticket Created: ${ticketId}`,
            html,
        });
    }

    async sendTicketAssignedEmail(ticketId: string, staffEmail: string, staffName: string, subject: string, customerName: string): Promise<void> {
        const html = `
            <h2>New Ticket Assigned</h2>
            <p>Hi ${staffName},</p>
            <p>A new support ticket has been assigned to you.</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p>Please review and respond to this ticket as soon as possible.</p>
            <p>Best regards,<br/>Support System</p>
        `;

        await this.sendEmail({
            to: staffEmail,
            subject: `Ticket Assigned: ${ticketId}`,
            html,
        });
    }

    async sendTicketResolvedEmail(ticketId: string, customerEmail: string, customerName: string, resolution: string): Promise<void> {
        const html = `
            <h2>Your Support Ticket Has Been Resolved</h2>
            <p>Dear ${customerName},</p>
            <p>We're pleased to inform you that your support ticket has been resolved.</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Resolution:</strong></p>
            <p>${resolution}</p>
            <p>If you have any further questions or concerns, please don't hesitate to contact us.</p>
            <p>Best regards,<br/>Support Team</p>
        `;

        await this.sendEmail({
            to: customerEmail,
            subject: `Ticket Resolved: ${ticketId}`,
            html,
        });
    }

    async sendCommentAddedEmail(ticketId: string, recipientEmail: string, recipientName: string, commenterName: string, message: string, isInternal: boolean): Promise<void> {
        const html = `
            <h2>New Comment on Ticket ${ticketId}</h2>
            <p>Hi ${recipientName},</p>
            <p>${commenterName} has added a comment to your support ticket.</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Comment:</strong></p>
            <p>${message}</p>
            ${isInternal ? '<p><em>This is an internal note and not visible to the customer.</em></p>' : ''}
            <p>Log in to your account to view the full ticket and respond.</p>
            <p>Best regards,<br/>Support System</p>
        `;

        await this.sendEmail({
            to: recipientEmail,
            subject: `New Comment on Ticket ${ticketId}`,
            html,
        });
    }

    async sendTicketEscalatedEmail(ticketId: string, escalatedToEmail: string, escalatedToName: string, reason: string, subject: string): Promise<void> {
        const html = `
            <h2>Ticket Escalated</h2>
            <p>Hi ${escalatedToName},</p>
            <p>A support ticket has been escalated and requires your attention.</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Escalation Reason:</strong> ${reason}</p>
            <p>Please review this ticket and take appropriate action.</p>
            <p>Best regards,<br/>Support System</p>
        `;

        await this.sendEmail({
            to: escalatedToEmail,
            subject: `Escalated Ticket: ${ticketId}`,
            html,
        });
    }

    private async sendEmail(options: EmailOptions): Promise<void> {
        try {
            if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
                console.warn('Email service not configured. Skipping email:', options.subject);
                return;
            }

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                ...options,
            });

            console.log(`Email sent to ${options.to}: ${options.subject}`);
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw - email failures shouldn't break the main flow
        }
    }
}

export const emailNotificationService = new EmailNotificationService();
