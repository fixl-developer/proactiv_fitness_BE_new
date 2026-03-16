import {
    SupportTicket,
    CustomerInquiry,
    KnowledgeBaseArticle,
    LiveChatSession,
    StaffSettings
} from './support.model';

export class SupportDataSeeder {
    /**
     * Seed initial support data
     */
    static async seedAll(): Promise<void> {
        try {
            console.log('🌱 Seeding support data...');

            await Promise.all([
                this.seedSupportTickets(),
                this.seedCustomerInquiries(),
                this.seedKnowledgeBaseArticles(),
                this.seedLiveChatSessions(),
                this.seedStaffSettings()
            ]);

            console.log('✅ Support data seeded successfully!');
        } catch (error) {
            console.error('❌ Error seeding support data:', error);
            throw error;
        }
    }

    /**
     * Seed support tickets
     */
    static async seedSupportTickets(): Promise<void> {
        const existingCount = await SupportTicket.countDocuments();
        if (existingCount > 0) {
            console.log('📋 Support tickets already exist, skipping...');
            return;
        }

        const tickets = [
            {
                ticketId: 'TKT-2024-001',
                subject: 'Login Issue - Cannot Access Account',
                description: 'User is unable to log into their account. Password reset attempts are failing.',
                customer: {
                    name: 'John Doe',
                    email: 'john.doe@email.com',
                    phone: '+1-555-0123'
                },
                priority: 'high',
                status: 'open',
                category: 'Account',
                tags: ['login', 'account', 'password'],
                assignedTo: 'support-agent-1',
                assignedAt: new Date(),
                escalated: false,
                attachments: [],
                comments: [
                    {
                        commentId: 'CMT-001',
                        author: 'John Doe',
                        authorType: 'customer',
                        message: 'I have been trying to reset my password for the past hour but the email never arrives.',
                        isInternal: false,
                        createdAt: new Date()
                    }
                ],
                createdBy: 'system',
                updatedBy: 'system'
            },
            {
                ticketId: 'TKT-2024-002',
                subject: 'Payment Processing Error',
                description: 'Customer payment was charged twice for the same class booking.',
                customer: {
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@email.com',
                    phone: '+1-555-0456'
                },
                priority: 'critical',
                status: 'in-progress',
                category: 'Payment',
                tags: ['payment', 'billing', 'refund'],
                assignedTo: 'support-agent-2',
                assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                escalated: true,
                escalatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                escalatedTo: 'manager-1',
                escalationReason: 'Financial issue requiring manager approval',
                responseTime: 0.5, // 30 minutes
                attachments: [],
                comments: [
                    {
                        commentId: 'CMT-002',
                        author: 'Sarah Johnson',
                        authorType: 'customer',
                        message: 'I was charged $150 twice for my daughter\'s gymnastics class. Please refund one charge.',
                        isInternal: false,
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
                    },
                    {
                        commentId: 'CMT-003',
                        author: 'support-agent-2',
                        authorType: 'staff',
                        message: 'Investigating the duplicate charge. Escalating to manager for refund approval.',
                        isInternal: true,
                        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
                    }
                ],
                createdBy: 'system',
                updatedBy: 'support-agent-2'
            },
            {
                ticketId: 'TKT-2024-003',
                subject: 'Class Schedule Information Request',
                description: 'Customer inquiring about available gymnastics classes for children.',
                customer: {
                    name: 'Mike Chen',
                    email: 'mike.chen@email.com',
                    phone: '+1-555-0789'
                },
                priority: 'medium',
                status: 'resolved',
                category: 'General',
                tags: ['schedule', 'classes', 'information'],
                assignedTo: 'support-agent-1',
                assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                responseTime: 0.25, // 15 minutes
                resolutionTime: 2.5, // 2.5 hours
                resolvedAt: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 hours ago
                firstResponseAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000), // 15 min after creation
                escalated: false,
                attachments: [],
                comments: [
                    {
                        commentId: 'CMT-004',
                        author: 'Mike Chen',
                        authorType: 'customer',
                        message: 'What gymnastics classes are available for my 8-year-old son?',
                        isInternal: false,
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    },
                    {
                        commentId: 'CMT-005',
                        author: 'support-agent-1',
                        authorType: 'staff',
                        message: 'We have beginner and intermediate classes available. I\'ll send you the complete schedule.',
                        isInternal: false,
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000)
                    }
                ],
                satisfaction: {
                    rating: 5,
                    feedback: 'Very helpful and quick response!',
                    submittedAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
                },
                resolution: 'Provided complete class schedule and enrollment information to customer.',
                createdBy: 'system',
                updatedBy: 'support-agent-1'
            }
        ];

        await SupportTicket.insertMany(tickets);
        console.log(`📋 Created ${tickets.length} support tickets`);
    }

    /**
     * Seed customer inquiries
     */
    static async seedCustomerInquiries(): Promise<void> {
        const existingCount = await CustomerInquiry.countDocuments();
        if (existingCount > 0) {
            console.log('💬 Customer inquiries already exist, skipping...');
            return;
        }

        const inquiries = [
            {
                inquiryId: 'INQ-2024-001',
                customerName: 'Emily Davis',
                customerEmail: 'emily.davis@email.com',
                customerPhone: '+1-555-0321',
                subject: 'Birthday Party Package Information',
                message: 'Hi, I\'m interested in booking a birthday party package for my daughter\'s 7th birthday. Can you provide details about available packages and pricing?',
                type: 'general',
                status: 'new',
                priority: 'medium',
                responses: []
            },
            {
                inquiryId: 'INQ-2024-002',
                customerName: 'David Wilson',
                customerEmail: 'david.wilson@email.com',
                subject: 'Billing Question - Membership Fee',
                message: 'I was charged a membership fee that I don\'t understand. Can someone explain what this charge is for?',
                type: 'billing',
                status: 'in-progress',
                priority: 'high',
                assignedTo: 'support-agent-2',
                assignedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                responses: [
                    {
                        responseId: 'RSP-001',
                        message: 'I\'ll look into your billing details and get back to you within the hour.',
                        author: 'support-agent-2',
                        authorType: 'staff',
                        isInternal: false,
                        timestamp: new Date(Date.now() - 25 * 60 * 1000)
                    }
                ]
            },
            {
                inquiryId: 'INQ-2024-003',
                customerName: 'Lisa Brown',
                customerEmail: 'lisa.brown@email.com',
                subject: 'Technical Issue with Mobile App',
                message: 'The mobile app keeps crashing when I try to book a class. I\'ve tried restarting my phone but the issue persists.',
                type: 'technical',
                status: 'resolved',
                priority: 'medium',
                assignedTo: 'support-agent-3',
                assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                responses: [
                    {
                        responseId: 'RSP-002',
                        message: 'Thank you for reporting this issue. Can you tell me which device and app version you\'re using?',
                        author: 'support-agent-3',
                        authorType: 'staff',
                        isInternal: false,
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
                    },
                    {
                        responseId: 'RSP-003',
                        message: 'I\'m using iPhone 12 with iOS 16.5 and app version 2.1.3',
                        author: 'Lisa Brown',
                        authorType: 'customer',
                        isInternal: false,
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
                    },
                    {
                        responseId: 'RSP-004',
                        message: 'We\'ve identified the issue and released a fix in version 2.1.4. Please update your app from the App Store.',
                        author: 'support-agent-3',
                        authorType: 'staff',
                        isInternal: false,
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                    }
                ]
            }
        ];

        await CustomerInquiry.insertMany(inquiries);
        console.log(`💬 Created ${inquiries.length} customer inquiries`);
    }

    /**
     * Seed knowledge base articles
     */
    static async seedKnowledgeBaseArticles(): Promise<void> {
        const existingCount = await KnowledgeBaseArticle.countDocuments();
        if (existingCount > 0) {
            console.log('📚 Knowledge base articles already exist, skipping...');
            return;
        }

        const articles = [
            {
                articleId: 'KB-2024-001',
                title: 'How to Book a Gymnastics Class',
                content: `# How to Book a Gymnastics Class

Follow these simple steps to book a gymnastics class:

## Step 1: Create an Account
1. Visit our website or download our mobile app
2. Click "Sign Up" and fill in your details
3. Verify your email address

## Step 2: Browse Classes
1. Navigate to the "Classes" section
2. Filter by age group, skill level, and location
3. View class schedules and instructor information

## Step 3: Select and Book
1. Choose your preferred class time
2. Add to cart and proceed to checkout
3. Complete payment to confirm your booking

## Step 4: Confirmation
You'll receive a confirmation email with:
- Class details and location
- What to bring
- Cancellation policy

For any questions, contact our support team at support@proactivfitness.com`,
                category: 'Booking',
                tags: ['booking', 'classes', 'registration', 'how-to'],
                status: 'published',
                author: 'Support Team',
                featured: true,
                views: 245,
                helpful: 23,
                notHelpful: 2,
                version: 1,
                relatedArticles: ['KB-2024-002', 'KB-2024-003'],
                attachments: [],
                createdBy: 'admin',
                updatedBy: 'admin'
            },
            {
                articleId: 'KB-2024-002',
                title: 'Payment Methods and Billing Information',
                content: `# Payment Methods and Billing

## Accepted Payment Methods
We accept the following payment methods:
- Credit Cards (Visa, MasterCard, American Express)
- Debit Cards
- PayPal
- Bank Transfer (for monthly memberships)

## Billing Cycles
- **Single Classes**: Charged immediately upon booking
- **Monthly Memberships**: Charged on the same date each month
- **Annual Memberships**: Charged annually with 10% discount

## Refund Policy
- **24+ hours before class**: Full refund
- **2-24 hours before class**: 50% refund
- **Less than 2 hours**: No refund (credit for future class)

## Payment Issues
If you experience payment issues:
1. Check your card details are correct
2. Ensure sufficient funds are available
3. Contact your bank if the issue persists
4. Reach out to our support team for assistance

For billing questions, email billing@proactivfitness.com`,
                category: 'Payment',
                tags: ['payment', 'billing', 'refunds', 'methods'],
                status: 'published',
                author: 'Finance Team',
                featured: true,
                views: 189,
                helpful: 18,
                notHelpful: 1,
                version: 2,
                relatedArticles: ['KB-2024-001'],
                attachments: [],
                createdBy: 'admin',
                updatedBy: 'finance-admin'
            },
            {
                articleId: 'KB-2024-003',
                title: 'Account Registration and Profile Setup',
                content: `# Account Registration and Profile Setup

## Creating Your Account
1. **Visit Registration Page**: Go to our website and click "Sign Up"
2. **Enter Details**: Provide your email, create a password, and fill in basic information
3. **Verify Email**: Check your inbox and click the verification link
4. **Complete Profile**: Add additional details for a personalized experience

## Profile Information
Your profile should include:
- **Personal Details**: Name, date of birth, contact information
- **Emergency Contact**: Required for all participants under 18
- **Medical Information**: Any relevant health conditions or allergies
- **Preferences**: Preferred class times, skill level, goals

## Account Security
- Use a strong, unique password
- Enable two-factor authentication (recommended)
- Keep your contact information up to date
- Log out from shared devices

## Managing Your Account
- **Update Profile**: Access "My Account" to modify your information
- **View Bookings**: See all your current and past class bookings
- **Payment History**: Review all transactions and receipts
- **Preferences**: Customize notification settings

Need help? Contact support@proactivfitness.com`,
                category: 'Account',
                tags: ['registration', 'account', 'profile', 'setup'],
                status: 'published',
                author: 'Support Team',
                featured: false,
                views: 156,
                helpful: 15,
                notHelpful: 0,
                version: 1,
                relatedArticles: ['KB-2024-001'],
                attachments: [],
                createdBy: 'admin',
                updatedBy: 'admin'
            },
            {
                articleId: 'KB-2024-004',
                title: 'Troubleshooting Login Issues',
                content: `# Troubleshooting Login Issues

## Common Login Problems

### Forgot Password
1. Click "Forgot Password" on the login page
2. Enter your registered email address
3. Check your inbox for reset instructions
4. Follow the link to create a new password

### Account Locked
If you've entered incorrect credentials multiple times:
- Wait 15 minutes before trying again
- Use the password reset option
- Contact support if the issue persists

### Email Not Recognized
- Check for typos in your email address
- Try alternative email addresses you might have used
- Contact support to verify your account details

### Browser Issues
- Clear your browser cache and cookies
- Try a different browser or incognito mode
- Disable browser extensions temporarily
- Ensure JavaScript is enabled

### Mobile App Issues
- Update to the latest app version
- Restart the app completely
- Clear app cache (Android) or reinstall (iOS)
- Check your internet connection

## Still Having Issues?
Contact our technical support team:
- Email: tech-support@proactivfitness.com
- Phone: 1-800-PROACTIV
- Live Chat: Available 9 AM - 6 PM EST

Include your registered email and description of the issue for faster resolution.`,
                category: 'Technical',
                tags: ['login', 'troubleshooting', 'password', 'technical'],
                status: 'draft',
                author: 'Tech Support',
                featured: false,
                views: 0,
                helpful: 0,
                notHelpful: 0,
                version: 1,
                relatedArticles: ['KB-2024-003'],
                attachments: [],
                createdBy: 'tech-admin',
                updatedBy: 'tech-admin'
            }
        ];

        await KnowledgeBaseArticle.insertMany(articles);
        console.log(`📚 Created ${articles.length} knowledge base articles`);
    }

    /**
     * Seed live chat sessions
     */
    static async seedLiveChatSessions(): Promise<void> {
        const existingCount = await LiveChatSession.countDocuments();
        if (existingCount > 0) {
            console.log('💬 Live chat sessions already exist, skipping...');
            return;
        }

        const sessions = [
            {
                sessionId: 'CHAT-2024-001',
                customerName: 'Alex Thompson',
                customerEmail: 'alex.thompson@email.com',
                status: 'active',
                startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                assignedAgent: 'support-agent-1',
                assignedAt: new Date(Date.now() - 9 * 60 * 1000),
                priority: 'medium',
                department: 'General Support',
                messages: [
                    {
                        messageId: 'MSG-001',
                        sender: 'customer',
                        message: 'Hi, I need help with booking a trial class for my daughter',
                        timestamp: new Date(Date.now() - 10 * 60 * 1000),
                        type: 'text',
                        status: 'read'
                    },
                    {
                        messageId: 'MSG-002',
                        sender: 'agent',
                        message: 'Hello! I\'d be happy to help you book a trial class. How old is your daughter?',
                        timestamp: new Date(Date.now() - 9 * 60 * 1000),
                        type: 'text',
                        status: 'read'
                    },
                    {
                        messageId: 'MSG-003',
                        sender: 'customer',
                        message: 'She\'s 6 years old and has never done gymnastics before',
                        timestamp: new Date(Date.now() - 8 * 60 * 1000),
                        type: 'text',
                        status: 'read'
                    }
                ]
            },
            {
                sessionId: 'CHAT-2024-002',
                customerName: 'Maria Rodriguez',
                customerEmail: 'maria.rodriguez@email.com',
                status: 'waiting',
                startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                priority: 'high',
                department: 'Billing Support',
                messages: [
                    {
                        messageId: 'MSG-004',
                        sender: 'customer',
                        message: 'I was charged twice for the same class, need immediate help',
                        timestamp: new Date(Date.now() - 5 * 60 * 1000),
                        type: 'text',
                        status: 'sent'
                    }
                ]
            }
        ];

        await LiveChatSession.insertMany(sessions);
        console.log(`💬 Created ${sessions.length} live chat sessions`);
    }

    /**
     * Seed staff settings
     */
    static async seedStaffSettings(): Promise<void> {
        const existingCount = await StaffSettings.countDocuments();
        if (existingCount > 0) {
            console.log('⚙️ Staff settings already exist, skipping...');
            return;
        }

        const settings = [
            {
                userId: 'support-agent-1',
                profile: {
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john.smith@proactivfitness.com',
                    phone: '+1-555-1001',
                    department: 'Customer Support',
                    role: 'Senior Support Agent',
                    timezone: 'America/New_York',
                    language: 'English'
                },
                notifications: {
                    emailNotifications: true,
                    pushNotifications: true,
                    smsNotifications: false,
                    ticketAssignments: true,
                    escalations: true,
                    systemUpdates: true,
                    weeklyReports: true,
                    soundEnabled: true,
                    desktopNotifications: true
                },
                security: {
                    twoFactorEnabled: true,
                    sessionTimeout: 60,
                    passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                    loginHistory: true,
                    ipRestriction: false
                },
                preferences: {
                    theme: 'light',
                    ticketsPerPage: 25,
                    defaultPriority: 'medium',
                    autoRefresh: true,
                    refreshInterval: 30,
                    showClosedTickets: false,
                    compactView: false
                }
            },
            {
                userId: 'support-agent-2',
                profile: {
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    email: 'sarah.johnson@proactivfitness.com',
                    phone: '+1-555-1002',
                    department: 'Customer Support',
                    role: 'Support Agent',
                    timezone: 'America/Los_Angeles',
                    language: 'English'
                },
                notifications: {
                    emailNotifications: true,
                    pushNotifications: true,
                    smsNotifications: true,
                    ticketAssignments: true,
                    escalations: true,
                    systemUpdates: false,
                    weeklyReports: true,
                    soundEnabled: false,
                    desktopNotifications: true
                },
                security: {
                    twoFactorEnabled: false,
                    sessionTimeout: 30,
                    passwordLastChanged: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                    loginHistory: true,
                    ipRestriction: false
                },
                preferences: {
                    theme: 'dark',
                    ticketsPerPage: 50,
                    defaultPriority: 'high',
                    autoRefresh: true,
                    refreshInterval: 15,
                    showClosedTickets: true,
                    compactView: true
                }
            }
        ];

        await StaffSettings.insertMany(settings);
        console.log(`⚙️ Created ${settings.length} staff settings`);
    }

    /**
     * Clear all support data (for testing)
     */
    static async clearAll(): Promise<void> {
        try {
            console.log('🗑️ Clearing all support data...');

            await Promise.all([
                SupportTicket.deleteMany({}),
                CustomerInquiry.deleteMany({}),
                KnowledgeBaseArticle.deleteMany({}),
                LiveChatSession.deleteMany({}),
                StaffSettings.deleteMany({})
            ]);

            console.log('✅ All support data cleared!');
        } catch (error) {
            console.error('❌ Error clearing support data:', error);
            throw error;
        }
    }
}