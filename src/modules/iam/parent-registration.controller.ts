import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import authService from './auth.service';
import userService from './user.service';

interface ParentRegistrationData {
    // Step 1: Account Info
    email: string;
    password: string;
    confirmPassword: string;

    // Step 2: Parent Info
    parentFirstName: string;
    parentLastName: string;
    phone: string;

    // Step 3: Address
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };

    // Step 4: Children
    children: Array<{
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: 'male' | 'female' | 'other';
    }>;

    // Step 5: Emergency Contact
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };

    // Step 6: Preferences
    preferences: {
        newsletter: boolean;
        smsNotifications: boolean;
        emailNotifications: boolean;
    };
}

/**
 * Parent Registration Controller
 * Handles multi-step parent registration from frontend
 */
export class ParentRegistrationController extends BaseController {
    /**
     * Complete parent registration (all steps combined)
     * POST /api/v1/auth/register/parent
     */
    async registerParent(req: Request, res: Response) {
        try {
            const data: ParentRegistrationData = req.body;

            // Validate password confirmation
            if (data.password !== data.confirmPassword) {
                return this.sendBadRequest(res, 'Passwords do not match');
            }

            // Step 1: Create user account
            const userResult = await authService.register({
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
                firstName: data.parentFirstName,
                lastName: data.parentLastName,
                role: 'PARENT' as any,
                phone: data.phone,
            });

            // Step 2: Create children as User docs (role=STUDENT, parentId=<parent>)
            // — this is the SAME shape the parent dashboard reads from
            // (GET /api/v1/parent/children queries User by parentId / role=STUDENT).
            // The previous CRM-based path was a no-op: family.service / child.service
            // were never implemented in modules/crm, and the catch swallowed the
            // MODULE_NOT_FOUND so children were silently dropped.
            const createdChildren: any[] = [];
            if (Array.isArray(data.children) && data.children.length > 0) {
                const { User } = require('./user.model');
                const sanitize = (s: string) =>
                    String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const parentId = userResult.user.id;

                for (const child of data.children) {
                    try {
                        const localPart = `${sanitize(child.firstName) || 'child'}.${sanitize(child.lastName) || 'user'}.${Date.now()}${Math.floor(Math.random() * 1000)}`;
                        const childDoc = await User.create({
                            firstName: child.firstName,
                            lastName: child.lastName,
                            dateOfBirth: child.dateOfBirth || undefined,
                            gender: child.gender ? String(child.gender).toUpperCase() : undefined,
                            role: 'STUDENT',
                            status: 'ACTIVE',
                            parentId,
                            createdBy: parentId,
                            createdByAdmin: true,
                            isEmailVerified: true,
                            medicalInfo: {
                                allergies: [],
                                medications: [],
                                emergencyContact: data.emergencyContact?.phone || '',
                                conditions: [],
                            },
                            email: `${localPart}@student.local`,
                            password: `student-placeholder-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
                        });
                        createdChildren.push(childDoc._id);
                    } catch (childErr: any) {
                        // Don't fail the whole signup if a single child fails to save —
                        // log it and continue so the parent account is still created.
                        console.error('[parent-register] failed to create child', {
                            firstName: child.firstName,
                            lastName: child.lastName,
                            error: childErr?.message,
                        });
                    }
                }
            }

            // Step 4: Send welcome email (if notification service exists)
            try {
                const notificationService = require('../notifications/notification.service').default;

                await notificationService.sendEmail({
                    to: data.email,
                    subject: 'Welcome to Proactiv Fitness!',
                    template: 'welcome',
                    data: {
                        firstName: data.parentFirstName,
                        childrenCount: data.children?.length || 0,
                    },
                });
            } catch (error) {
                console.log('Notification service not available, skipping welcome email');
            }

            // Return response with tokens and user data
            return this.sendCreated(
                res,
                {
                    token: (userResult as any).token || (userResult as any).accessToken,
                    user: {
                        id: userResult.user.id,
                        email: userResult.user.email,
                        firstName: userResult.user.firstName,
                        lastName: userResult.user.lastName,
                        role: userResult.user.role,
                        isEmailVerified: userResult.user.isEmailVerified,
                    },
                    childrenCount: createdChildren.length,
                },
                'Registration successful! Welcome to Proactiv Fitness.'
            );
        } catch (error: any) {
            console.error('Parent registration error:', error);
            return this.sendError(res, error.message || 'Registration failed');
        }
    }

    /**
     * Validate email availability
     * POST /api/v1/auth/register/check-email
     */
    async checkEmailAvailability(req: Request, res: Response) {
        try {
            const { email } = req.body;

            if (!email) {
                return this.sendBadRequest(res, 'Email is required');
            }

            // Check if email exists
            const user = await userService.getUserByEmail(email);
            const available = !user;

            return this.sendSuccess(res, {
                available,
                message: available ? 'Email available' : 'Email already registered',
            });
        } catch (error: any) {
            return this.sendError(res, error.message || 'Email check failed');
        }
    }

    /**
     * Save partial registration data (for multi-step form)
     * POST /api/v1/auth/register/save-progress
     */
    async saveRegistrationProgress(req: Request, res: Response) {
        try {
            const { email, step, data } = req.body;

            // Store in cache/session (implement based on your caching strategy)
            // For now, just return success
            // In production, use Redis or similar to store temporary data

            return this.sendSuccess(res, {
                message: 'Progress saved',
                step,
            });
        } catch (error: any) {
            return this.sendError(res, error.message || 'Failed to save progress');
        }
    }
}

export default new ParentRegistrationController();
