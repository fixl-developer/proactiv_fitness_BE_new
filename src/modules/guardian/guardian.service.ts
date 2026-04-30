import { BaseService } from '@shared/base/base.service';
import { GuardianLink } from './guardian.model';
import { IGuardianLink, IGuardianLinkCreate, IGuardianLinkUpdate, GuardianLinkStatus } from './guardian.interface';
import { User } from '../iam/user.model';
import { NotificationService } from '../notifications/notifications.service';
import crypto from 'crypto';
import logger from '@shared/utils/logger.util';

class GuardianService extends BaseService<IGuardianLink> {
    private notificationService: NotificationService;

    constructor() {
        super(GuardianLink, 'guardian');
        this.notificationService = new NotificationService();
    }

    /**
     * Add a guardian link for a student (user)
     */
    async addGuardian(studentId: string, data: IGuardianLinkCreate, tenantId?: string): Promise<IGuardianLink> {
        // Check if student exists
        const student = await User.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // If guardianId provided, verify the guardian user exists
        let guardianUser = null;
        if (data.guardianId) {
            guardianUser = await User.findById(data.guardianId);
            if (!guardianUser) {
                throw new Error('Guardian user not found');
            }

            // Check if link already exists
            const existingLink = await GuardianLink.findOne({
                studentId,
                guardianId: data.guardianId,
                isDeleted: { $ne: true },
                status: { $ne: GuardianLinkStatus.REMOVED },
            });
            if (existingLink) {
                throw new Error('This guardian is already linked to you');
            }
        }

        // If no guardianId but email provided, check if a user exists with that email
        if (!data.guardianId && data.guardianEmail) {
            const existingUser = await User.findOne({
                email: data.guardianEmail.toLowerCase(),
                isDeleted: { $ne: true },
            });
            if (existingUser) {
                data.guardianId = existingUser._id.toString();
                guardianUser = existingUser;

                // Check duplicate
                const existingLink = await GuardianLink.findOne({
                    studentId,
                    guardianId: existingUser._id,
                    isDeleted: { $ne: true },
                    status: { $ne: GuardianLinkStatus.REMOVED },
                });
                if (existingLink) {
                    throw new Error('This guardian is already linked to you');
                }
            }
        }

        // If this is marked as primary, unset existing primary
        if (data.isPrimary) {
            await GuardianLink.updateMany(
                { studentId, isPrimary: true, isDeleted: { $ne: true } },
                { isPrimary: false }
            );
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // If guardian is a registered user or has email -> PENDING (needs acceptance)
        // If manual add (no guardianId, no email) -> LINKED directly
        const isManualAdd = !data.guardianId && !data.guardianEmail;
        const initialStatus = isManualAdd ? GuardianLinkStatus.LINKED : GuardianLinkStatus.PENDING;

        const guardianLink = await GuardianLink.create({
            studentId,
            guardianId: data.guardianId || undefined,
            relationship: data.relationship,
            isPrimary: data.isPrimary || false,
            isEmergencyContact: data.isEmergencyContact || false,
            status: initialStatus,
            guardianName: data.guardianName,
            guardianEmail: data.guardianEmail,
            guardianPhone: data.guardianPhone,
            guardianAddress: data.guardianAddress,
            notes: data.notes,
            invitationToken: isManualAdd ? undefined : invitationToken,
            invitationSentAt: isManualAdd ? undefined : new Date(),
            invitationExpiresAt: isManualAdd ? undefined : invitationExpiresAt,
            linkedAt: isManualAdd ? new Date() : undefined,
            tenantId,
            createdBy: studentId,
        });

        // Send notification to guardian (only if not a manual add)
        if (!isManualAdd) {
            await this.sendGuardianNotification(guardianLink, student, guardianUser);
        }

        return guardianLink;
    }

    /**
     * Get all guardians for a student
     */
    async getStudentGuardians(studentId: string): Promise<IGuardianLink[]> {
        return await GuardianLink.find({
            studentId,
            isDeleted: { $ne: true },
            status: { $ne: GuardianLinkStatus.REMOVED },
        })
            .populate('guardianId', 'firstName lastName email phone profileImage role')
            .sort({ isPrimary: -1, createdAt: -1 });
    }

    /**
     * Get all students linked to a guardian
     */
    async getGuardianStudents(guardianId: string): Promise<IGuardianLink[]> {
        return await GuardianLink.find({
            guardianId,
            isDeleted: { $ne: true },
            status: GuardianLinkStatus.LINKED,
        })
            .populate('studentId', 'firstName lastName email phone profileImage currentProgram level')
            .sort({ createdAt: -1 });
    }

    /**
     * Update a guardian link
     */
    async updateGuardianLink(
        linkId: string,
        studentId: string,
        data: IGuardianLinkUpdate
    ): Promise<IGuardianLink | null> {
        // If setting as primary, unset existing primary
        if (data.isPrimary) {
            await GuardianLink.updateMany(
                { studentId, isPrimary: true, _id: { $ne: linkId }, isDeleted: { $ne: true } },
                { isPrimary: false }
            );
        }

        return await GuardianLink.findOneAndUpdate(
            { _id: linkId, studentId, isDeleted: { $ne: true } },
            { ...data, updatedBy: studentId },
            { new: true, runValidators: true }
        ).populate('guardianId', 'firstName lastName email phone profileImage role');
    }

    /**
     * Remove a guardian link (soft delete)
     */
    async removeGuardianLink(linkId: string, studentId: string): Promise<boolean> {
        const result = await GuardianLink.findOneAndUpdate(
            { _id: linkId, studentId, isDeleted: { $ne: true } },
            {
                status: GuardianLinkStatus.REMOVED,
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: studentId,
            },
            { new: true }
        );
        return !!result;
    }

    /**
     * Accept a guardian link invitation (from guardian side)
     */
    async acceptInvitation(linkId: string, guardianUserId: string): Promise<IGuardianLink | null> {
        const link = await GuardianLink.findOne({
            _id: linkId,
            isDeleted: { $ne: true },
            status: GuardianLinkStatus.PENDING,
        });

        if (!link) {
            throw new Error('Guardian link not found or already processed');
        }

        // If link has guardianId, verify it matches
        if (link.guardianId && link.guardianId.toString() !== guardianUserId) {
            throw new Error('You are not authorized to accept this invitation');
        }

        // If no guardianId set yet, set it now
        if (!link.guardianId) {
            link.guardianId = guardianUserId as any;
        }

        link.status = GuardianLinkStatus.LINKED;
        link.linkedAt = new Date();
        await link.save();

        // Notify the student
        try {
            const guardian = await User.findById(guardianUserId);
            const student = await User.findById(link.studentId);
            if (student && guardian) {
                await this.notificationService.sendNotification({
                    userId: link.studentId.toString(),
                    tenantId: student.tenantId || 'default',
                    recipient: student.email || link.studentId.toString(),
                    title: 'Guardian Linked',
                    message: `${guardian.firstName} ${guardian.lastName} has accepted your guardian link request.`,
                    type: 'in_app',
                    category: 'alert',
                    metadata: { linkId: link._id, guardianId: guardianUserId },
                });
            }
        } catch (err) {
            logger.warn('Failed to send guardian acceptance notification', { error: err });
        }

        return await GuardianLink.findById(linkId)
            .populate('guardianId', 'firstName lastName email phone profileImage role')
            .populate('studentId', 'firstName lastName email phone profileImage');
    }

    /**
     * Reject a guardian link invitation
     */
    async rejectInvitation(linkId: string, guardianUserId: string): Promise<IGuardianLink | null> {
        const link = await GuardianLink.findOne({
            _id: linkId,
            isDeleted: { $ne: true },
            status: GuardianLinkStatus.PENDING,
        });

        if (!link) {
            throw new Error('Guardian link not found or already processed');
        }

        if (link.guardianId && link.guardianId.toString() !== guardianUserId) {
            throw new Error('You are not authorized to reject this invitation');
        }

        link.status = GuardianLinkStatus.REJECTED;
        link.rejectedAt = new Date();
        await link.save();

        // Notify the student
        try {
            const guardian = await User.findById(guardianUserId);
            const student = await User.findById(link.studentId);
            if (guardian && student) {
                await this.notificationService.sendNotification({
                    userId: link.studentId.toString(),
                    tenantId: student.tenantId || 'default',
                    recipient: student.email || link.studentId.toString(),
                    title: 'Guardian Request Declined',
                    message: `${guardian.firstName} ${guardian.lastName} has declined your guardian link request.`,
                    type: 'in_app',
                    category: 'alert',
                    metadata: { linkId: link._id },
                });
            }
        } catch (err) {
            logger.warn('Failed to send guardian rejection notification', { error: err });
        }

        return link;
    }

    /**
     * Accept invitation via token (for non-registered / email-based invitations)
     */
    async acceptByToken(token: string, guardianUserId: string): Promise<IGuardianLink | null> {
        const link = await GuardianLink.findOne({
            invitationToken: token,
            isDeleted: { $ne: true },
            status: GuardianLinkStatus.PENDING,
        }).select('+invitationToken');

        if (!link) {
            throw new Error('Invalid or expired invitation token');
        }

        if (link.invitationExpiresAt && link.invitationExpiresAt < new Date()) {
            throw new Error('Invitation has expired');
        }

        link.guardianId = guardianUserId as any;
        link.status = GuardianLinkStatus.LINKED;
        link.linkedAt = new Date();
        link.invitationToken = undefined;
        await link.save();

        // Notify the student
        try {
            const guardian = await User.findById(guardianUserId);
            const student = await User.findById(link.studentId);
            if (student && guardian) {
                await this.notificationService.sendNotification({
                    userId: link.studentId.toString(),
                    tenantId: student.tenantId || 'default',
                    recipient: student.email || link.studentId.toString(),
                    title: 'Guardian Linked',
                    message: `${guardian.firstName} ${guardian.lastName} has accepted your guardian link request via invitation.`,
                    type: 'in_app',
                    category: 'alert',
                    metadata: { linkId: link._id, guardianId: guardianUserId },
                });
            }
        } catch (err) {
            logger.warn('Failed to send token-based acceptance notification', { error: err });
        }

        return await GuardianLink.findById(link._id)
            .populate('guardianId', 'firstName lastName email phone profileImage role')
            .populate('studentId', 'firstName lastName email phone profileImage');
    }

    /**
     * Resend invitation to a guardian
     */
    async resendInvitation(linkId: string, studentId: string): Promise<IGuardianLink | null> {
        const link = await GuardianLink.findOne({
            _id: linkId,
            studentId,
            isDeleted: { $ne: true },
            status: GuardianLinkStatus.PENDING,
        });

        if (!link) {
            throw new Error('Guardian link not found or not in pending state');
        }

        // Generate new token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        link.invitationToken = invitationToken;
        link.invitationSentAt = new Date();
        link.invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await link.save();

        const student = await User.findById(studentId);
        const guardianUser = link.guardianId ? await User.findById(link.guardianId) : null;
        await this.sendGuardianNotification(link, student, guardianUser);

        return link;
    }

    /**
     * Get pending invitations for a guardian user (by their userId or email)
     */
    async getPendingInvitations(guardianUserId: string): Promise<IGuardianLink[]> {
        const user = await User.findById(guardianUserId);
        if (!user) return [];

        return await GuardianLink.find({
            isDeleted: { $ne: true },
            status: GuardianLinkStatus.PENDING,
            $or: [
                { guardianId: guardianUserId },
                { guardianEmail: user.email?.toLowerCase() },
            ],
        })
            .populate('studentId', 'firstName lastName email phone profileImage currentProgram level')
            .sort({ createdAt: -1 });
    }

    /**
     * Get a single guardian link by ID
     */
    async getGuardianLinkById(linkId: string): Promise<IGuardianLink | null> {
        return await GuardianLink.findOne({
            _id: linkId,
            isDeleted: { $ne: true },
        })
            .populate('guardianId', 'firstName lastName email phone profileImage role')
            .populate('studentId', 'firstName lastName email phone profileImage');
    }

    /**
     * Search for users to link as guardian (by email or name)
     */
    async searchGuardianUsers(query: string, excludeStudentId: string): Promise<any[]> {
        if (!query || query.length < 2) return [];

        const users = await User.find({
            _id: { $ne: excludeStudentId },
            isDeleted: { $ne: true },
            status: 'ACTIVE',
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } },
            ],
        })
            .select('firstName lastName email phone profileImage role')
            .limit(10);

        return users;
    }

    /**
     * Send notification to guardian about the link request
     */
    private async sendGuardianNotification(
        link: IGuardianLink,
        student: any,
        guardianUser: any
    ): Promise<void> {
        try {
            const studentName = student ? `${student.firstName} ${student.lastName}` : 'A student';
            const tenantId = link.tenantId || student?.tenantId || 'default';

            // In-app notification (if guardian is a registered user)
            if (link.guardianId) {
                await this.notificationService.sendNotification({
                    userId: link.guardianId.toString(),
                    tenantId,
                    recipient: guardianUser?.email || link.guardianEmail || link.guardianId.toString(),
                    title: 'Guardian Link Request',
                    message: `${studentName} has requested to add you as their ${link.relationship}. Please accept or decline this request.`,
                    type: 'in_app',
                    category: 'alert',
                    metadata: {
                        linkId: link._id,
                        studentId: link.studentId,
                        action: 'guardian_link_request',
                    },
                });
            }

            // Email notification (if email available)
            if (link.guardianEmail) {
                await this.notificationService.sendNotification({
                    userId: link.guardianId?.toString() || 'unregistered',
                    tenantId,
                    recipient: link.guardianEmail,
                    title: 'Guardian Link Request',
                    message: `${studentName} has requested to add you as their ${link.relationship} on ProActiv Fitness. If you have an account, please log in to accept or decline. If not, you can register and use this invitation.`,
                    type: 'email',
                    category: 'alert',
                    metadata: {
                        linkId: link._id,
                        invitationToken: link.invitationToken,
                        studentName,
                        action: 'guardian_link_request',
                    },
                });
            }
        } catch (error) {
            logger.warn('Failed to send guardian notification', { error, linkId: link._id });
        }
    }
}

export default new GuardianService();
