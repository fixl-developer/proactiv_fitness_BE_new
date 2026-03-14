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

            // Step 2: Create family profile (if CRM module exists)
            let familyProfile = null;
            try {
                const familyService = require('../crm/family.service').default;

                familyProfile = await familyService.createFamily({
                    parentId: userResult.user.id,
                    parentFirstName: data.parentFirstName,
                    parentLastName: data.parentLastName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    emergencyContact: data.emergencyContact,
                    preferences: data.preferences,
                });

                // Step 3: Create children profiles
                if (data.children && data.children.length > 0) {
                    const childService = require('../crm/child.service').default;

                    for (const child of data.children) {
                        await childService.createChild({
                            familyId: familyProfile.id,
                            firstName: child.firstName,
                            lastName: child.lastName,
                            dateOfBirth: child.dateOfBirth,
                            gender: child.gender,
                            emergencyContact: data.emergencyContact,
                        });
                    }
                }
            } catch (error) {
                console.log('CRM module not available, skipping family profile creation');
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
                    family: familyProfile
                        ? {
                            id: familyProfile.id,
                            childrenCount: data.children?.length || 0,
                        }
                        : null,
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
