import {
    PartnerProfile, PartnerProgram, PartnerStudent, PartnerBooking,
    PartnerNotification, PartnerCommission, PartnerGoal, PartnerRevenue,
    PartnerDocument, PartnerContact, PartnerAgreement, PartnerIntegration,
    PartnerCampaign, PartnerLead, PartnerTicket, PartnerMessage,
    PartnerSettings, PartnerPayout
} from './schemas';

/**
 * Seeds partner portal data into the database.
 * This should be called once during server startup to ensure data exists.
 * It checks if data already exists before inserting.
 */
export async function seedPartnerData(partnerId: string = 'partner-1'): Promise<void> {
    try {
        // Check if partner profile already exists
        const existingProfile = await PartnerProfile.findOne({ partnerId });
        if (existingProfile) {
            console.log('[Partner Seed] Partner data already exists, skipping seed.');
            return;
        }

        console.log('[Partner Seed] Seeding partner data...');

        // 1. Partner Profile
        await PartnerProfile.create({
            partnerId,
            partnerName: 'Partner Admin',
            partnerType: 'sports_academy',
            email: 'partner@proactiv.com',
            phone: '+1 (555) 123-4567',
            address: '123 Sports Avenue, Mumbai, Maharashtra 400001',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            website: 'https://proactivsports.com',
            businessName: 'ProActiv Sports Academy',
            businessType: 'Sports & Fitness',
            location: 'Mumbai, India',
            status: 'active',
            tier: 'gold',
            commissionRate: 15,
            joinDate: new Date('2024-01-15'),
            rating: 4.2,
        });

        // 2. Programs
        await PartnerProgram.insertMany([
            { partnerId, name: 'Youth Soccer Training', description: 'Comprehensive soccer training for ages 8-16', category: 'Sports', status: 'active', enrolledStudents: 45, revenue: 13500, rating: 4.5 },
            { partnerId, name: 'Adult Fitness Bootcamp', description: 'High-intensity fitness program for adults', category: 'Fitness', status: 'active', enrolledStudents: 32, revenue: 9600, rating: 4.3 },
            { partnerId, name: 'Swimming Fundamentals', description: 'Learn-to-swim program for all ages', category: 'Aquatics', status: 'active', enrolledStudents: 28, revenue: 8400, rating: 4.7 },
            { partnerId, name: 'Basketball Academy', description: 'Professional basketball training program', category: 'Sports', status: 'active', enrolledStudents: 22, revenue: 6600, rating: 4.1 },
            { partnerId, name: 'Yoga & Meditation', description: 'Mindfulness and yoga classes', category: 'Wellness', status: 'active', enrolledStudents: 18, revenue: 5400, rating: 4.8 },
            { partnerId, name: 'Tennis Coaching', description: 'Professional tennis coaching', category: 'Sports', status: 'inactive', enrolledStudents: 11, revenue: 3300, rating: 4.0 },
        ]);

        // 3. Students
        await PartnerStudent.insertMany([
            { partnerId, name: 'Rahul Sharma', email: 'rahul@email.com', phone: '+91 98765 43210', enrolledPrograms: 2, totalSpent: 4500, status: 'active', joinDate: new Date('2024-01-10'), lastActivity: new Date() },
            { partnerId, name: 'Priya Patel', email: 'priya@email.com', phone: '+91 98765 43211', enrolledPrograms: 1, totalSpent: 3000, status: 'active', joinDate: new Date('2024-02-15'), lastActivity: new Date() },
            { partnerId, name: 'Amit Kumar', email: 'amit@email.com', phone: '+91 98765 43212', enrolledPrograms: 3, totalSpent: 7500, status: 'active', joinDate: new Date('2024-01-05'), lastActivity: new Date() },
            { partnerId, name: 'Sneha Gupta', email: 'sneha@email.com', phone: '+91 98765 43213', enrolledPrograms: 1, totalSpent: 2500, status: 'active', joinDate: new Date('2024-03-20'), lastActivity: new Date() },
            { partnerId, name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 98765 43214', enrolledPrograms: 2, totalSpent: 5000, status: 'active', joinDate: new Date('2024-04-01'), lastActivity: new Date() },
            { partnerId, name: 'Ananya Reddy', email: 'ananya@email.com', phone: '+91 98765 43215', enrolledPrograms: 1, totalSpent: 3500, status: 'inactive', joinDate: new Date('2024-02-28'), lastActivity: new Date('2024-10-15') },
            { partnerId, name: 'Rohan Mehta', email: 'rohan@email.com', phone: '+91 98765 43216', enrolledPrograms: 2, totalSpent: 6000, status: 'active', joinDate: new Date('2024-05-10'), lastActivity: new Date() },
            { partnerId, name: 'Kavita Joshi', email: 'kavita@email.com', phone: '+91 98765 43217', enrolledPrograms: 1, totalSpent: 2000, status: 'active', joinDate: new Date('2024-06-01'), lastActivity: new Date() },
        ]);

        // 4. Bookings
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
        await PartnerBooking.insertMany([
            { partnerId, studentName: 'Rahul Sharma', programName: 'Youth Soccer Training', date: today, time: '10:00 AM', status: 'confirmed' },
            { partnerId, studentName: 'Priya Patel', programName: 'Yoga & Meditation', date: today, time: '06:00 AM', status: 'confirmed' },
            { partnerId, studentName: 'Amit Kumar', programName: 'Swimming Fundamentals', date: tomorrow, time: '04:00 PM', status: 'pending' },
            { partnerId, studentName: 'Vikram Singh', programName: 'Adult Fitness Bootcamp', date: tomorrow, time: '07:00 AM', status: 'confirmed' },
            { partnerId, studentName: 'Rohan Mehta', programName: 'Basketball Academy', date: dayAfter, time: '05:00 PM', status: 'pending' },
        ]);

        // 5. Notifications
        await PartnerNotification.insertMany([
            { partnerId, type: 'update', title: 'New Student Enrolled', message: 'Rahul Sharma has enrolled in Youth Soccer Training', isRead: false, actionUrl: '/partner/students' },
            { partnerId, type: 'alert', title: 'Commission Processed', message: 'Your commission of $2,175 has been processed for March', isRead: false, actionUrl: '/partner/commissions', createdAt: new Date(Date.now() - 3600000) },
            { partnerId, type: 'reminder', title: 'Report Due', message: 'Monthly performance report is due in 3 days', isRead: true, actionUrl: '/partner/reports', createdAt: new Date(Date.now() - 86400000) },
            { partnerId, type: 'announcement', title: 'Platform Update', message: 'New analytics features are now available', isRead: true, actionUrl: '/partner/analytics', createdAt: new Date(Date.now() - 172800000) },
            { partnerId, type: 'update', title: 'Program Review', message: 'Swimming Fundamentals received a 5-star review', isRead: false, createdAt: new Date(Date.now() - 259200000) },
        ]);

        // 6. Commissions
        await PartnerCommission.insertMany([
            { partnerId, amount: 2175, rate: 15, period: 'March 2024', status: 'paid', calculatedAt: new Date('2024-04-01'), paidAt: new Date('2024-04-15') },
            { partnerId, amount: 2460, rate: 15, period: 'April 2024', status: 'paid', calculatedAt: new Date('2024-05-01'), paidAt: new Date('2024-05-15') },
            { partnerId, amount: 2550, rate: 15, period: 'May 2024', status: 'paid', calculatedAt: new Date('2024-06-01'), paidAt: new Date('2024-06-15') },
            { partnerId, amount: 3210, rate: 15, period: 'June 2024', status: 'pending', calculatedAt: new Date('2024-07-01') },
        ]);

        // 7. Goals
        await PartnerGoal.insertMany([
            { partnerId, goalName: 'Reach 200 Students', targetValue: 200, currentValue: 156, progress: 78, status: 'on-track', dueDate: new Date('2025-03-31') },
            { partnerId, goalName: 'Monthly Revenue $10K', targetValue: 10000, currentValue: 8200, progress: 82, status: 'on-track', dueDate: new Date('2025-06-30') },
            { partnerId, goalName: 'Customer Satisfaction 4.5', targetValue: 4.5, currentValue: 4.2, progress: 93, status: 'at-risk', dueDate: new Date('2025-03-31') },
            { partnerId, goalName: 'Launch 15 Programs', targetValue: 15, currentValue: 12, progress: 80, status: 'on-track', dueDate: new Date('2025-06-30') },
        ]);

        // 8. Monthly Revenue/Trends Data
        await PartnerRevenue.insertMany([
            { partnerId, month: '2024-01', revenue: 6200, students: 120, bookings: 340, rating: 4.0 },
            { partnerId, month: '2024-02', revenue: 7100, students: 128, bookings: 365, rating: 4.1 },
            { partnerId, month: '2024-03', revenue: 7800, students: 135, bookings: 390, rating: 4.2 },
            { partnerId, month: '2024-04', revenue: 8200, students: 142, bookings: 410, rating: 4.2 },
            { partnerId, month: '2024-05', revenue: 8500, students: 148, bookings: 425, rating: 4.3 },
            { partnerId, month: '2024-06', revenue: 10700, students: 156, bookings: 450, rating: 4.2 },
        ]);

        // 9. Payouts
        await PartnerPayout.insertMany([
            { partnerId, amount: 7185, method: 'bank_transfer', status: 'completed', reference: 'TXN-98765', requestedAt: new Date('2024-06-01'), processedAt: new Date('2024-06-05') },
            { partnerId, amount: 5010, method: 'bank_transfer', status: 'completed', reference: 'TXN-87654', requestedAt: new Date('2024-05-01'), processedAt: new Date('2024-05-06') },
            { partnerId, amount: 2175, method: 'bank_transfer', status: 'pending', reference: 'TXN-76543', requestedAt: new Date('2024-07-01') },
        ]);

        // 10. Documents
        await PartnerDocument.insertMany([
            { partnerId, name: 'Partnership Agreement 2024', type: 'pdf', description: 'Official partnership agreement document', url: '/documents/agreement-2024.pdf', size: '2.4 MB', downloads: 12, rating: 4.5, tags: ['agreement', 'legal'], status: 'active' },
            { partnerId, name: 'Training Manual v3.0', type: 'pdf', description: 'Complete training manual for coaches', url: '/documents/training-manual.pdf', size: '5.1 MB', downloads: 45, rating: 4.8, tags: ['training', 'manual'], status: 'active' },
            { partnerId, name: 'Brand Guidelines', type: 'pdf', description: 'Brand guidelines and asset usage', url: '/documents/brand-guidelines.pdf', size: '3.7 MB', downloads: 23, rating: 4.2, tags: ['brand', 'marketing'], status: 'active' },
            { partnerId, name: 'Safety Protocols', type: 'pdf', description: 'Safety protocols and emergency procedures', url: '/documents/safety.pdf', size: '1.8 MB', downloads: 56, rating: 4.6, tags: ['safety', 'compliance'], status: 'active' },
            { partnerId, name: 'Marketing Toolkit', type: 'zip', description: 'Complete marketing toolkit with templates', url: '/documents/marketing-toolkit.zip', size: '15.2 MB', downloads: 34, rating: 4.3, tags: ['marketing', 'templates'], status: 'active' },
            { partnerId, name: 'Insurance Certificate', type: 'pdf', description: 'Current insurance certificate', url: '/documents/insurance.pdf', size: '0.8 MB', downloads: 8, rating: 0, tags: ['insurance', 'legal'], status: 'active' },
        ]);

        // 11. Contacts
        await PartnerContact.insertMany([
            { partnerId, name: 'Partner Admin', email: 'partner@proactiv.com', phone: '+91 98765 43210', role: 'Primary Contact', isPrimary: true },
            { partnerId, name: 'Rajesh Kumar', email: 'rajesh@proactiv.com', phone: '+91 98765 43211', role: 'Operations Manager', isPrimary: false },
        ]);

        // 12. Agreements
        await PartnerAgreement.insertMany([
            { partnerId, type: 'Revenue Share', status: 'active', startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), terms: 'Standard revenue sharing at 30% partner share', signedAt: new Date('2024-01-01') },
            { partnerId, type: 'Exclusive Partnership', status: 'active', startDate: new Date('2024-06-01'), endDate: new Date('2025-06-01'), terms: 'Exclusive partnership for sports training in Mumbai region', signedAt: new Date('2024-06-01') },
        ]);

        // 13. Integrations
        await PartnerIntegration.insertMany([
            { partnerId, name: 'Google Calendar', description: 'Sync class schedules and events with Google Calendar', category: 'Scheduling', type: 'calendar', status: 'connected', iconName: 'Calendar', color: 'text-blue-600', bgColor: 'bg-blue-50', lastSync: new Date(), syncFrequency: 'Real-time', dataPoints: 1250, health: 98 },
            { partnerId, name: 'Mailchimp', description: 'Email marketing and newsletter management', category: 'Marketing', type: 'email', status: 'connected', iconName: 'Mail', color: 'text-yellow-600', bgColor: 'bg-yellow-50', lastSync: new Date(Date.now() - 3600000), syncFrequency: 'Hourly', dataPoints: 850, health: 95 },
            { partnerId, name: 'Stripe', description: 'Payment processing and financial transactions', category: 'Payments', type: 'payment', status: 'connected', iconName: 'Database', color: 'text-purple-600', bgColor: 'bg-purple-50', lastSync: new Date(), syncFrequency: 'Real-time', dataPoints: 2100, health: 100 },
            { partnerId, name: 'WhatsApp Business', description: 'Customer messaging and notifications', category: 'Messaging', type: 'messaging', status: 'disconnected', iconName: 'Smartphone', color: 'text-green-600', bgColor: 'bg-green-50', lastSync: new Date(Date.now() - 604800000), syncFrequency: 'N/A', dataPoints: 0, health: 0 },
        ]);

        // 14. Marketing Campaigns
        await PartnerCampaign.insertMany([
            { partnerId, name: 'Spring Enrollment Drive', type: 'email', status: 'active', budget: 5000, spent: 3200, impressions: 45000, clicks: 2800, conversions: 156, roi: 340, startDate: new Date('2024-03-01'), endDate: new Date('2024-05-31') },
            { partnerId, name: 'Summer Camp Promotion', type: 'social', status: 'active', budget: 3000, spent: 1500, impressions: 32000, clicks: 1900, conversions: 89, roi: 280, startDate: new Date('2024-05-01'), endDate: new Date('2024-07-31') },
            { partnerId, name: 'Back to School Special', type: 'display', status: 'draft', budget: 4000, spent: 0, impressions: 0, clicks: 0, conversions: 0, roi: 0, startDate: new Date('2024-08-01'), endDate: new Date('2024-09-30') },
        ]);

        // 15. Marketing Leads
        await PartnerLead.insertMany([
            { partnerId, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+91 98765 00001', source: 'Website', status: 'qualified', interestLevel: 'high' },
            { partnerId, name: 'Michael Chen', email: 'michael@email.com', phone: '+91 98765 00002', source: 'Referral', status: 'contacted', interestLevel: 'medium' },
            { partnerId, name: 'Priya Desai', email: 'priya.d@email.com', phone: '+91 98765 00003', source: 'Social Media', status: 'new', interestLevel: 'high' },
            { partnerId, name: 'David Wilson', email: 'david@email.com', phone: '+91 98765 00004', source: 'Event', status: 'converted', interestLevel: 'high' },
        ]);

        // 16. Support Tickets
        await PartnerTicket.insertMany([
            { partnerId, subject: 'Payment processing issue', description: 'Students unable to complete online payments', status: 'open', priority: 'high', category: 'billing', assignedTo: 'Support Team A',
              messages: [
                { sender: 'Partner Admin', senderType: 'partner', message: 'Students facing issues with online payments.', createdAt: new Date(Date.now() - 7200000) },
                { sender: 'Support Agent', senderType: 'support', message: 'We are investigating. Can you share a screenshot?', createdAt: new Date(Date.now() - 3600000) },
              ] },
            { partnerId, subject: 'Schedule display incorrect', description: 'Class schedule showing wrong times', status: 'in_progress', priority: 'medium', category: 'technical', assignedTo: 'Dev Team',
              messages: [{ sender: 'Partner Admin', senderType: 'partner', message: 'Morning schedule showing incorrect times.', createdAt: new Date(Date.now() - 86400000) }] },
            { partnerId, subject: 'Need additional user accounts', description: 'Request for more staff accounts', status: 'resolved', priority: 'low', category: 'operational', assignedTo: 'Support Team',
              messages: [
                { sender: 'Partner Admin', senderType: 'partner', message: 'We need 3 more staff accounts.', createdAt: new Date(Date.now() - 172800000) },
                { sender: 'Support Agent', senderType: 'support', message: '3 new staff accounts created. Credentials sent to your email.', createdAt: new Date(Date.now() - 86400000) },
              ], resolvedAt: new Date(Date.now() - 86400000) },
        ]);

        // 17. Messages
        await PartnerMessage.insertMany([
            { partnerId, from: 'ProActiv Support', fromType: 'support', subject: 'Welcome to Partner Portal', body: 'Welcome! Here is your getting started guide...', isRead: true, priority: 'MEDIUM', replies: [] },
            { partnerId, from: 'Revenue Team', fromType: 'support', subject: 'March Commission Statement', body: 'Your March commission of $2,175 has been calculated.', isRead: true, priority: 'MEDIUM',
              replies: [
                { sender: 'Partner Admin', message: 'Thanks! When will this be processed?', createdAt: new Date(Date.now() - 172800000) },
                { sender: 'Revenue Team', message: 'Within 5 business days.', createdAt: new Date(Date.now() - 86400000) }
              ] },
            { partnerId, from: 'Program Manager', fromType: 'support', subject: 'New Program Approval', body: 'Your request to add "Advanced Swimming" has been approved!', isRead: false, priority: 'HIGH', replies: [] },
        ]);

        // 18. Settings
        await PartnerSettings.create({
            partnerId,
            profile: { organizationName: 'ProActiv Sports Academy', contactPerson: 'Partner Admin', email: 'partner@proactiv.com', phone: '+1 (555) 123-4567', website: 'https://proactivsports.com', address: '123 Sports Avenue, Mumbai 400001' },
            billing: { billingEmail: 'billing@proactiv.com', paymentMethod: 'Bank Transfer', billingAddress: '123 Sports Avenue, Mumbai 400001', taxId: 'GSTIN12345678' },
            api: { apiKey: 'pk_live_xxxxxxxxxxxxx', webhookUrl: 'https://proactivsports.com/webhooks/proactiv', environment: 'production' },
            notifications: { emailNotifications: true, smsNotifications: false, webhookNotifications: true, dailyDigest: true, weeklyReport: true }
        });

        console.log('[Partner Seed] Partner data seeded successfully!');
    } catch (error) {
        console.error('[Partner Seed] Error seeding partner data:', error);
    }
}
