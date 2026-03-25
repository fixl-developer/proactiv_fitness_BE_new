import {
    IPartnerProfile, IBulkStudentImport, IPartnerDashboard, IRevenueSharing,
    IComplianceExport, ITenderDocumentation, IMunicipalReporting, IPartnerAgreement,
    IPartnerPerformance, IPartnerCommunication, IPartnerSupport
} from './partner.model';
import {
    PartnerProfile, PartnerProgram, PartnerStudent, PartnerBooking,
    PartnerNotification, PartnerCommission, PartnerGoal, PartnerRevenue, PartnerPayout,
    PartnerDocument, PartnerContact, PartnerAgreement, PartnerIntegration,
    PartnerCampaign, PartnerLead, PartnerTicket, PartnerMessage, PartnerSettings
} from './schemas';
import { seedPartnerData } from './partner-seed';
import mongoose from 'mongoose';
import { Program } from '../programs/program.model';

export class PartnerService {
    async createPartnerProfile(profileData: Partial<IPartnerProfile>): Promise<IPartnerProfile> {
        const profile: IPartnerProfile = {
            partnerId: `PARTNER-${Date.now()}`,
            partnerName: profileData.partnerName || '',
            partnerType: profileData.partnerType || 'school',
            email: profileData.email || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            city: profileData.city || '',
            state: profileData.state || '',
            country: profileData.country || '',
            logo: profileData.logo || '',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return profile;
    }

    async bulkImportStudents(importData: Partial<IBulkStudentImport>): Promise<IBulkStudentImport> {
        const bulkImport: IBulkStudentImport = {
            importId: `IMPORT-${Date.now()}`,
            partnerId: importData.partnerId || '',
            centerId: importData.centerId || '',
            importDate: new Date(),
            totalStudents: importData.totalStudents || 0,
            successfulImports: 0,
            failedImports: 0,
            students: importData.students || [],
            status: 'pending',
            createdAt: new Date()
        };
        return bulkImport;
    }

    async getPartnerDashboard(partnerId: string): Promise<IPartnerDashboard> {
        return {
            dashboardId: `DASH-${Date.now()}`,
            partnerId,
            totalStudents: 156,
            activePrograms: 12,
            totalRevenue: 48500,
            monthlyRevenue: 8200,
            studentGrowth: 12.5,
            engagementRate: 78,
            satisfactionScore: 4.2,
            lastUpdated: new Date(),
            createdAt: new Date()
        };
    }

    async calculateRevenueShare(partnerId: string, period: string): Promise<IRevenueSharing> {
        return {
            revenueSharingId: `REVSHARE-${Date.now()}`,
            partnerId,
            centerId: '',
            period: period as any,
            startDate: new Date(),
            endDate: new Date(),
            totalRevenue: 0,
            partnerShare: 0,
            sharePercentage: 0,
            paymentStatus: 'pending',
            createdAt: new Date()
        };
    }

    async generateComplianceExport(exportData: Partial<IComplianceExport>): Promise<IComplianceExport> {
        return {
            exportId: `EXPORT-${Date.now()}`,
            partnerId: exportData.partnerId || '',
            exportType: exportData.exportType || 'financial',
            exportDate: new Date(),
            data: exportData.data || {},
            format: exportData.format || 'pdf',
            status: 'generated',
            createdAt: new Date()
        };
    }

    async submitTenderDocumentation(tenderData: Partial<ITenderDocumentation>): Promise<ITenderDocumentation> {
        return {
            tenderId: `TENDER-${Date.now()}`,
            partnerId: tenderData.partnerId || '',
            tenderName: tenderData.tenderName || '',
            description: tenderData.description || '',
            documents: tenderData.documents || [],
            submissionDate: new Date(),
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async submitMunicipalReport(reportData: Partial<IMunicipalReporting>): Promise<IMunicipalReporting> {
        return {
            reportingId: `MUNIREPORT-${Date.now()}`,
            partnerId: reportData.partnerId || '',
            reportType: reportData.reportType || 'enrollment',
            reportingPeriod: reportData.reportingPeriod || '',
            submissionDate: new Date(),
            data: reportData.data || {},
            status: 'draft',
            createdAt: new Date()
        };
    }

    async createPartnerAgreement(agreementData: Partial<IPartnerAgreement>): Promise<IPartnerAgreement> {
        return {
            agreementId: `AGREEMENT-${Date.now()}`,
            partnerId: agreementData.partnerId || '',
            centerId: agreementData.centerId || '',
            agreementType: agreementData.agreementType || 'standard',
            startDate: agreementData.startDate || new Date(),
            endDate: agreementData.endDate || new Date(),
            terms: agreementData.terms || '',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async getPartnerPerformance(partnerId: string, period: string): Promise<IPartnerPerformance> {
        return {
            performanceId: `PERF-${Date.now()}`,
            partnerId,
            period: (period as any) || 'monthly',
            date: new Date(),
            studentEnrollment: 156,
            studentRetention: 89,
            programCompletion: 76,
            satisfactionScore: 4.2,
            revenueGenerated: 48500,
            createdAt: new Date()
        };
    }

    async sendPartnerCommunication(commData: Partial<IPartnerCommunication>): Promise<IPartnerCommunication> {
        return {
            communicationId: `COMM-${Date.now()}`,
            partnerId: commData.partnerId || '',
            type: commData.type || 'email',
            subject: commData.subject || '',
            content: commData.content || '',
            sentDate: new Date(),
            status: 'sent',
            createdAt: new Date()
        };
    }

    async createSupportTicket(supportData: Partial<IPartnerSupport>): Promise<IPartnerSupport> {
        return {
            supportId: `SUPPORT-${Date.now()}`,
            partnerId: supportData.partnerId || '',
            issueType: supportData.issueType || 'technical',
            subject: supportData.subject || '',
            description: supportData.description || '',
            priority: supportData.priority || 'medium',
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async resolveSupportTicket(supportId: string, resolution: string): Promise<IPartnerSupport> {
        return {
            supportId,
            partnerId: '',
            issueType: 'technical',
            subject: '',
            description: resolution,
            priority: 'medium',
            status: 'resolved',
            resolvedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    // ===== New endpoints for full partner portal integration =====

    async getPartnerProfile(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        if (!profile) return null;
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const totalPrograms = await PartnerProgram.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const revenueAgg = await PartnerRevenue.aggregate([
            { $match: { partnerId } },
            { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
        return {
            id: profile.partnerId, partnerId: profile.partnerId,
            name: profile.partnerName, email: profile.email, phone: profile.phone,
            businessName: profile.businessName, businessType: profile.businessType,
            location: profile.location, status: profile.status,
            joinDate: profile.joinDate, tier: profile.tier,
            commissionRate: profile.commissionRate,
            totalRevenue, totalStudents, totalPrograms,
            rating: profile.rating, website: profile.website, address: profile.address,
        };
    }

    private async ensureSeeded(partnerId: string): Promise<void> {
        const exists = await PartnerProfile.findOne({ partnerId }).lean();
        if (!exists) {
            await seedPartnerData(partnerId);
        }
    }

    async updatePartnerProfile(partnerId: string, data: any): Promise<any> {
        const updated = await PartnerProfile.findOneAndUpdate(
            { partnerId },
            { $set: { ...data, updatedAt: new Date() } },
            { new: true, runValidators: true }
        ).lean();
        return updated || { ...data, partnerId, updatedAt: new Date() };
    }

    async getPartnerStats(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const activeStudents = await PartnerStudent.countDocuments({ partnerId, status: 'active', isDeleted: { $ne: true } });
        const totalPrograms = await PartnerProgram.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const activePrograms = await PartnerProgram.countDocuments({ partnerId, status: 'active', isDeleted: { $ne: true } });
        const revenueAgg = await PartnerRevenue.aggregate([
            { $match: { partnerId } },
            { $group: { _id: null, total: { $sum: '$revenue' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;
        const latestMonth = await PartnerRevenue.findOne({ partnerId }).sort({ month: -1 }).lean();
        const monthlyRevenue = latestMonth?.revenue || 0;
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        return {
            totalStudents, activeStudents, totalPrograms, activePrograms,
            totalRevenue, monthlyRevenue, growthRate: 12.5,
            retentionRate: 89, conversionRate: 34,
            satisfactionScore: profile?.rating || 4.2
        };
    }

    async getPartnerPrograms(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        // First try PartnerProgram collection (partner-specific programs)
        const ppQuery: any = { partnerId, isDeleted: { $ne: true } };
        if (filters?.category) ppQuery.category = filters.category;
        if (filters?.status) ppQuery.status = filters.status;
        const limit = parseInt(filters?.limit) || 20;
        const page = parseInt(filters?.page) || 1;
        const skip = (page - 1) * limit;

        const [partnerPrograms, ppTotal] = await Promise.all([
            PartnerProgram.find(ppQuery).sort({ revenue: -1 }).skip(skip).limit(limit).lean(),
            PartnerProgram.countDocuments(ppQuery)
        ]);

        if (ppTotal > 0) {
            return {
                programs: partnerPrograms.map((p: any) => ({
                    id: p._id.toString(), partnerId: p.partnerId,
                    name: p.name, description: p.description || '',
                    category: p.category || '', status: p.status,
                    enrolledStudents: p.enrolledStudents || 0,
                    revenue: p.revenue || 0, rating: p.rating || 0,
                    createdAt: p.createdAt
                })),
                total: ppTotal
            };
        }

        // Fallback: try Program collection (legacy)
        try {
            const query: any = {};
            if (mongoose.Types.ObjectId.isValid(partnerId)) {
                query.createdBy = new mongoose.Types.ObjectId(partnerId);
            }
            if (filters?.category) query.category = filters.category;
            if (filters?.status === 'active') query.isActive = true;
            if (filters?.status === 'inactive') query.isActive = false;
            const [programs, total] = await Promise.all([
                Program.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                Program.countDocuments(query)
            ]);
            return {
                programs: programs.map((p: any) => ({
                    id: p._id.toString(), partnerId,
                    name: p.name, description: p.description || p.shortDescription || '',
                    category: p.category || '', status: p.isActive ? 'active' : 'inactive',
                    enrolledStudents: p.enrollmentCount || 0,
                    revenue: (p.pricingModel?.basePrice || 0) * (p.enrollmentCount || 0),
                    rating: 0, createdAt: p.createdAt
                })),
                total
            };
        } catch (error) {
            console.error('Error fetching partner programs from DB:', error);
            return { programs: [], total: 0 };
        }
    }

    async createPartnerProgram(partnerId: string, data: any): Promise<any> {
        const objectId = mongoose.Types.ObjectId.isValid(partnerId)
            ? new mongoose.Types.ObjectId(partnerId)
            : new mongoose.Types.ObjectId();

        const program = await Program.create({
            name: data.name,
            description: data.description || '',
            shortDescription: (data.description || '').substring(0, 200),
            programType: 'regular',
            category: data.category || 'General',
            isActive: data.status === 'active',
            isPublic: true,
            enrollmentCount: parseInt(data.enrolledStudents) || 0,
            createdBy: objectId,
            updatedBy: objectId,
            businessUnitId: objectId,
            locationIds: [objectId],
            ageGroups: [{
                minAge: 5,
                maxAge: 99,
                ageType: 'years',
                description: 'All ages'
            }],
            skillLevels: ['beginner'],
            capacityRules: {
                minParticipants: 1,
                maxParticipants: 50,
                coachToParticipantRatio: 10,
                waitlistCapacity: 10,
                allowOverbooking: false
            },
            eligibilityRules: {
                ageRestrictions: {
                    minAge: 5,
                    maxAge: 99,
                    ageType: 'years',
                    description: 'All ages'
                },
                medicalClearanceRequired: false,
                parentalConsentRequired: false
            },
            pricingModel: {
                basePrice: parseFloat(data.revenue) || 0,
                currency: 'USD',
                pricingType: 'per_month'
            },
            classTemplates: [{
                name: data.name,
                description: data.description || 'Default class',
                duration: 60,
                activities: ['Training'],
                equipmentNeeded: [],
                safetyRequirements: [],
                learningObjectives: ['Skill development']
            }],
            sessionDuration: 60,
            sessionsPerWeek: 3,
            termDuration: 12,
            availableDays: ['monday', 'wednesday', 'friday'],
            tags: [data.category?.toLowerCase() || 'general']
        });

        return {
            id: program._id.toString(),
            partnerId,
            name: program.name,
            description: program.description,
            category: program.category,
            status: program.isActive ? 'active' : 'inactive',
            enrolledStudents: program.enrollmentCount || 0,
            revenue: parseFloat(data.revenue) || 0,
            rating: 0,
            createdAt: program.createdAt
        };
    }

    async updatePartnerProgram(partnerId: string, programId: string, data: any): Promise<any> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) {
            updateData.description = data.description;
            updateData.shortDescription = data.description.substring(0, 200);
        }
        if (data.category !== undefined) updateData.category = data.category;
        if (data.status !== undefined) updateData.isActive = data.status === 'active';
        if (data.enrolledStudents !== undefined) updateData.enrollmentCount = parseInt(data.enrolledStudents) || 0;
        if (data.revenue !== undefined && updateData.pricingModel === undefined) {
            updateData['pricingModel.basePrice'] = parseFloat(data.revenue) || 0;
        }

        if (mongoose.Types.ObjectId.isValid(partnerId)) {
            updateData.updatedBy = new mongoose.Types.ObjectId(partnerId);
        }

        const program = await Program.findByIdAndUpdate(
            programId,
            { $set: updateData },
            { new: true, runValidators: false }
        ).lean();

        if (!program) {
            throw new Error('Program not found');
        }

        return {
            id: (program as any)._id.toString(),
            partnerId,
            name: (program as any).name,
            description: (program as any).description,
            category: (program as any).category,
            status: (program as any).isActive ? 'active' : 'inactive',
            enrolledStudents: (program as any).enrollmentCount || 0,
            revenue: (program as any).pricingModel?.basePrice || 0,
            rating: 0,
            createdAt: (program as any).createdAt
        };
    }

    async deletePartnerProgram(partnerId: string, programId: string): Promise<any> {
        const program = await Program.findByIdAndDelete(programId);
        if (!program) {
            throw new Error('Program not found');
        }
        return { success: true, message: 'Program deleted successfully' };
    }

    async getPartnerStudents(partnerId: string, filters?: any): Promise<any> {
        const query: any = { partnerId };
        if (filters?.status) query.status = filters.status;

        const limit = parseInt(filters?.limit) || 20;
        const page = parseInt(filters?.page) || 1;
        const skip = (page - 1) * limit;

        const [students, total] = await Promise.all([
            PartnerStudent.find(query).sort({ joinDate: -1 }).skip(skip).limit(limit).lean(),
            PartnerStudent.countDocuments(query)
        ]);

        return {
            students: students.map((s: any) => ({
                id: s._id.toString(),
                partnerId: s.partnerId,
                name: s.name,
                email: s.email,
                phone: s.phone || '',
                enrolledPrograms: s.enrolledPrograms || 0,
                totalSpent: s.totalSpent || 0,
                status: s.status,
                joinDate: s.joinDate,
                lastActivity: s.lastActivity,
            })),
            total,
        };
    }

    async createPartnerStudent(partnerId: string, data: any): Promise<any> {
        const student = await PartnerStudent.create({
            partnerId,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            enrolledPrograms: parseInt(data.enrolledPrograms) || 0,
            totalSpent: parseFloat(data.totalSpent) || 0,
            status: data.status || 'active',
            joinDate: new Date(),
            lastActivity: new Date(),
        });

        return {
            id: student._id.toString(),
            partnerId: student.partnerId,
            name: student.name,
            email: student.email,
            phone: student.phone,
            enrolledPrograms: student.enrolledPrograms,
            totalSpent: student.totalSpent,
            status: student.status,
            joinDate: student.joinDate,
            lastActivity: student.lastActivity,
        };
    }

    async updatePartnerStudent(partnerId: string, studentId: string, data: any): Promise<any> {
        const updateData: any = { lastActivity: new Date() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.enrolledPrograms !== undefined) updateData.enrolledPrograms = parseInt(data.enrolledPrograms) || 0;
        if (data.totalSpent !== undefined) updateData.totalSpent = parseFloat(data.totalSpent) || 0;
        if (data.status !== undefined) updateData.status = data.status;

        const student = await PartnerStudent.findOneAndUpdate(
            { _id: studentId, partnerId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!student) {
            throw new Error('Student not found');
        }

        return {
            id: (student as any)._id.toString(),
            partnerId: (student as any).partnerId,
            name: (student as any).name,
            email: (student as any).email,
            phone: (student as any).phone || '',
            enrolledPrograms: (student as any).enrolledPrograms || 0,
            totalSpent: (student as any).totalSpent || 0,
            status: (student as any).status,
            joinDate: (student as any).joinDate,
            lastActivity: (student as any).lastActivity,
        };
    }

    async deletePartnerStudent(partnerId: string, studentId: string): Promise<any> {
        const student = await PartnerStudent.findOneAndDelete({ _id: studentId, partnerId });
        if (!student) {
            throw new Error('Student not found');
        }
        return { success: true, message: 'Student deleted successfully' };
    }

    async getPartnerBookings(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const query: any = { partnerId, isDeleted: { $ne: true } };
        const limit = filters?.limit ? parseInt(filters.limit) : 100;
        const page = filters?.page ? parseInt(filters.page) : 1;
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            PartnerBooking.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(),
            PartnerBooking.countDocuments(query)
        ]);
        return { bookings: bookings.map((b: any) => ({ id: b._id, ...b })), total };
    }

    async getPartnerRevenue(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const monthlyData = await PartnerRevenue.find({ partnerId }).sort({ month: 1 }).lean();
        const totalRevenue = monthlyData.reduce((s, m) => s + (m.revenue || 0), 0);
        const latestRevenue = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].revenue : 0;
        const prevRevenue = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2].revenue : 0;
        const revenueGrowth = prevRevenue > 0 ? Math.round(((latestRevenue - prevRevenue) / prevRevenue) * 1000) / 10 : 0;
        const revenueByMonth = monthlyData.map(m => {
            const parts = m.month.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return { month: monthNames[parseInt(parts[1]) - 1] || m.month, revenue: m.revenue };
        });
        return { totalRevenue, monthlyRevenue: latestRevenue, weeklyRevenue: Math.round(latestRevenue / 4), revenueGrowth, revenueByMonth };
    }

    async getPartnerMetrics(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const activeStudents = await PartnerStudent.countDocuments({ partnerId, status: 'active', isDeleted: { $ne: true } });
        const retentionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
        return {
            occupancyRate: 78, staffUtilization: 65,
            customerSatisfaction: profile?.rating || 0,
            retentionRate, conversionRate: 34,
            averageSessionRating: profile?.rating ? profile.rating + 0.3 : 4.5
        };
    }

    async getPartnerNotifications(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const query: any = { partnerId, isDeleted: { $ne: true } };
        const limit = filters?.limit ? parseInt(filters.limit) : 100;
        const page = filters?.page ? parseInt(filters.page) : 1;
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            PartnerNotification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            PartnerNotification.countDocuments(query)
        ]);
        return { notifications: notifications.map((n: any) => ({ id: n._id, ...n })), total };
    }

    async markNotificationRead(notificationId: string): Promise<any> {
        const updated = await PartnerNotification.findByIdAndUpdate(
            notificationId,
            { $set: { isRead: true } },
            { new: true }
        ).lean();
        return updated || { id: notificationId, isRead: true, updatedAt: new Date() };
    }

    async getPartnerDocuments(partnerId: string): Promise<any[]> {
        await this.ensureSeeded(partnerId);
        const docs = await PartnerDocument.find({ partnerId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
        return docs.map((doc: any) => ({ id: doc._id.toString(), ...doc, _id: undefined }));
    }

    async uploadDocument(partnerId: string, data: any): Promise<any> {
        const doc = await PartnerDocument.create({
            partnerId,
            name: data.name,
            type: data.type || 'pdf',
            description: data.description || '',
            url: data.url || `/documents/${Date.now()}.pdf`,
            size: data.size || '0 KB',
            status: 'active',
        });
        const d: any = doc.toObject();
        return { id: d._id.toString(), ...d, _id: undefined };
    }

    async getPartnerContacts(partnerId: string): Promise<any[]> {
        await this.ensureSeeded(partnerId);
        const contacts = await PartnerContact.find({ partnerId, isDeleted: { $ne: true } }).lean();
        return contacts.map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined }));
    }

    async updatePartnerContacts(partnerId: string, contacts: any[]): Promise<any[]> {
        const results: any[] = [];
        for (const contact of contacts) {
            if (contact.id) {
                const updated = await PartnerContact.findByIdAndUpdate(
                    contact.id,
                    { $set: { ...contact, partnerId, id: undefined } },
                    { new: true }
                ).lean();
                if (updated) {
                    results.push({ id: (updated as any)._id.toString(), ...updated, _id: undefined });
                }
            } else {
                const created = await PartnerContact.create({ ...contact, partnerId });
                const d: any = created.toObject();
                results.push({ id: d._id.toString(), ...d, _id: undefined });
            }
        }
        return results;
    }

    async getPartnerAgreements(partnerId: string): Promise<any[]> {
        await this.ensureSeeded(partnerId);
        const agreements = await PartnerAgreement.find({ partnerId, isDeleted: { $ne: true } }).lean();
        return agreements.map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined }));
    }

    // ===== Analytics =====

    async getPerformanceMetrics(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const activeStudents = await PartnerStudent.countDocuments({ partnerId, status: 'active', isDeleted: { $ne: true } });
        const totalPrograms = await PartnerProgram.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const revenueAgg = await PartnerRevenue.aggregate([
            { $match: { partnerId } },
            { $group: { _id: null, total: { $sum: '$revenue' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const retentionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
        // Calculate growth from last 2 months of revenue
        const recentMonths = await PartnerRevenue.find({ partnerId }).sort({ month: -1 }).limit(2).lean();
        let growthRate = 0;
        if (recentMonths.length === 2) {
            const curr = recentMonths[0].revenue;
            const prev = recentMonths[1].revenue;
            growthRate = prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : 0;
        }
        return {
            totalRevenue, totalStudents, totalPrograms,
            averageRating: profile?.rating || 0,
            growthRate, conversionRate: 34,
            retentionRate, customerSatisfaction: profile?.rating || 0
        };
    }

    async getPerformanceTrends(partnerId: string, filters?: any): Promise<any[]> {
        await this.ensureSeeded(partnerId);
        const trends = await PartnerRevenue.find({ partnerId }).sort({ month: 1 }).lean();
        return trends.map(t => ({
            date: t.month, revenue: t.revenue,
            students: t.students, bookings: t.bookings, rating: t.rating
        }));
    }

    async getStudentProgress(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const limit = filters?.limit ? parseInt(filters.limit) : 20;
        const students = await PartnerStudent.find({ partnerId, isDeleted: { $ne: true } }).limit(limit).lean();
        const programs = await PartnerProgram.find({ partnerId, isDeleted: { $ne: true } }).lean();
        const programMap: Record<string, string> = {};
        programs.forEach((p: any) => { programMap[p._id.toString()] = p.name; });
        return {
            students: students.map((s: any) => ({
                studentId: s._id.toString(), studentName: s.name,
                programName: programMap[s.programId] || 'General Program',
                progress: s.status === 'active' ? Math.min(Math.round((s.enrolledPrograms || 1) * 25), 100) : 100,
                status: s.status, startDate: s.joinDate,
                score: s.status === 'active' ? Math.round(70 + (s.totalSpent || 0) / 200) : 95
            })),
            total: students.length
        };
    }

    async getClassPerformance(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const programs = await PartnerProgram.find({ partnerId, isDeleted: { $ne: true } }).lean();
        return {
            classes: programs.map((p: any) => ({
                classId: p._id.toString(), className: p.name,
                enrolledStudents: p.enrolledStudents || 0,
                completedStudents: Math.round((p.enrolledStudents || 0) * 0.8),
                averageScore: p.rating ? Math.round(p.rating * 18) : 80,
                rating: p.rating || 0, revenue: p.revenue || 0,
                status: p.status
            })),
            total: programs.length
        };
    }

    async getRevenueAnalytics(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const programs = await PartnerProgram.find({ partnerId, isDeleted: { $ne: true } }).sort({ revenue: -1 }).lean();
        const monthlyData = await PartnerRevenue.find({ partnerId }).sort({ month: 1 }).lean();
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const totalRevenue = programs.reduce((s, p) => s + (p.revenue || 0), 0);
        const totalPrograms = programs.length;
        const revenueByProgram = programs.map(p => ({ program: p.name, revenue: p.revenue || 0 }));
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = monthlyData.map(m => {
            const parts = m.month.split('-');
            return { month: monthNames[parseInt(parts[1]) - 1] || m.month, revenue: m.revenue };
        });
        const recentMonths = monthlyData.slice(-2);
        let revenueGrowth = 0;
        if (recentMonths.length === 2) {
            const prev = recentMonths[0].revenue;
            const curr = recentMonths[1].revenue;
            revenueGrowth = prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : 0;
        }
        return {
            totalRevenue,
            averageRevenuePerStudent: totalStudents > 0 ? Math.round((totalRevenue / totalStudents) * 100) / 100 : 0,
            averageRevenuePerProgram: totalPrograms > 0 ? Math.round((totalRevenue / totalPrograms) * 100) / 100 : 0,
            revenueByProgram, revenueByMonth, revenueGrowth
        };
    }

    async getGrowthAnalytics(partnerId: string, period?: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const revenueMonths = await PartnerRevenue.find({ partnerId }).sort({ month: -1 }).limit(4).lean();
        let revenueGrowth = 0, studentGrowth = 0, bookingGrowth = 0;
        if (revenueMonths.length >= 2) {
            const curr = revenueMonths[0]; const prev = revenueMonths[1];
            revenueGrowth = prev.revenue > 0 ? Math.round(((curr.revenue - prev.revenue) / prev.revenue) * 1000) / 10 : 0;
            studentGrowth = prev.students > 0 ? Math.round(((curr.students - prev.students) / prev.students) * 1000) / 10 : 0;
            bookingGrowth = prev.bookings > 0 ? Math.round(((curr.bookings - prev.bookings) / prev.bookings) * 1000) / 10 : 0;
        }
        const totalPrograms = await PartnerProgram.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const activePrograms = await PartnerProgram.countDocuments({ partnerId, status: 'active', isDeleted: { $ne: true } });
        const programGrowth = totalPrograms > 0 ? Math.round((activePrograms / totalPrograms) * 100) : 0;
        return {
            studentGrowth, programGrowth, revenueGrowth, bookingGrowth,
            trends: [
                { metric: 'Students', growth: studentGrowth },
                { metric: 'Programs', growth: programGrowth },
                { metric: 'Revenue', growth: revenueGrowth },
                { metric: 'Bookings', growth: bookingGrowth }
            ]
        };
    }

    async getComplianceMetrics(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const docs = await PartnerDocument.find({ partnerId, isDeleted: { $ne: true } }).lean();
        const active = docs.filter((d: any) => d.status === 'active');
        const complianceScore = docs.length > 0 ? Math.round((active.length / docs.length) * 100) : 100;
        return {
            complianceScore, documentsSubmitted: docs.length,
            documentsExpiring: 0, auditsPassed: Math.max(active.length - 1, 0),
            auditsFailed: 0, status: complianceScore >= 80 ? 'compliant' : 'non-compliant'
        };
    }

    async getQualityMetrics(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const activeStudents = await PartnerStudent.countDocuments({ partnerId, status: 'active', isDeleted: { $ne: true } });
        const inactiveStudents = totalStudents - activeStudents;
        const dropoutRate = totalStudents > 0 ? Math.round((inactiveStudents / totalStudents) * 100) : 0;
        const completionRate = 100 - dropoutRate;
        const rating = profile?.rating || 0;
        return {
            qualityScore: Math.round((rating / 5) * 100),
            studentSatisfaction: rating,
            instructorRating: Math.min(rating + 0.3, 5),
            completionRate,
            dropoutRate,
            improvementAreas: dropoutRate > 10 ? ['Student retention', 'Evening class attendance'] : ['Equipment maintenance']
        };
    }

    async getCustomerSatisfaction(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const rating = profile?.rating || 4.0;
        const programs = await PartnerProgram.find({ partnerId, isDeleted: { $ne: true } }).lean();
        const avgProgramRating = programs.length > 0
            ? programs.reduce((s, p) => s + (p.rating || 0), 0) / programs.length
            : rating;
        return {
            overallScore: rating,
            serviceQuality: Math.min(rating + 0.1, 5),
            instructorQuality: Math.min(avgProgramRating + 0.2, 5),
            valueForMoney: Math.max(rating - 0.2, 0),
            recommendationScore: Math.round(rating * 2),
            reviews: programs.slice(0, 3).map((p: any) => ({
                rating: p.rating || rating, comment: `Great ${p.name} program!`,
                date: new Date(p.createdAt).toISOString().split('T')[0]
            }))
        };
    }

    async getMarketAnalytics(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const totalPrograms = await PartnerProgram.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const revenueAgg = await PartnerRevenue.aggregate([{ $match: { partnerId } }, { $group: { _id: null, total: { $sum: '$revenue' } } }]);
        const totalRevenue = revenueAgg[0]?.total || 0;
        return {
            marketShare: Math.round((totalStudents / 1000) * 100) / 10,
            competitorCount: 8, marketGrowth: 7.5,
            opportunities: totalRevenue > 40000 ? ['Corporate wellness', 'Online modules', 'Youth academy'] : ['Student enrollment', 'New programs'],
            threats: ['Seasonal dips', totalPrograms < 5 ? 'Limited program diversity' : 'New competitor entry']
        };
    }

    async getCompetitiveAnalysis(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const totalPrograms = await PartnerProgram.countDocuments({ partnerId, isDeleted: { $ne: true } });
        return {
            partnerId, partnerName: profile?.businessName || 'Partner Academy',
            marketPosition: totalStudents > 100 ? 2 : 4,
            competitiveAdvantages: [
                totalPrograms > 4 ? 'Diverse programs' : 'Focused expertise',
                'Experienced staff', 'Modern facilities'
            ],
            weaknesses: ['Limited online presence'],
            recommendations: ['Invest in digital marketing', 'Expand online offerings']
        };
    }

    async getForecastAnalytics(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const recentMonths = await PartnerRevenue.find({ partnerId }).sort({ month: -1 }).limit(3).lean();
        const avgRevenue = recentMonths.length > 0
            ? recentMonths.reduce((s, m) => s + m.revenue, 0) / recentMonths.length
            : 8000;
        const growthFactor = 1.08;
        return {
            nextMonthRevenue: Math.round(avgRevenue * growthFactor),
            nextQuarterRevenue: Math.round(avgRevenue * growthFactor * 3.2),
            nextYearRevenue: Math.round(avgRevenue * growthFactor * 13),
            confidence: recentMonths.length >= 3 ? 78 : 55,
            assumptions: ['Stable enrollment growth', 'No seasonal disruptions']
        };
    }

    async getBenchmarkAnalytics(partnerId: string, metric?: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const revenueAgg = await PartnerRevenue.aggregate([{ $match: { partnerId } }, { $group: { _id: null, total: { $sum: '$revenue' } } }]);
        const partnerMetric = revenueAgg[0]?.total || 0;
        const industryAverage = 42000;
        const topPerformer = 75000;
        const percentile = partnerMetric > 0 ? Math.min(Math.round((partnerMetric / topPerformer) * 100), 99) : 50;
        return {
            partnerMetric, industryAverage, topPerformer, percentile,
            comparison: partnerMetric > industryAverage ? 'Above average' : 'Below average'
        };
    }

    async getGoalProgress(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const limit = filters?.limit ? parseInt(filters.limit) : 100;
        const [goals, total] = await Promise.all([
            PartnerGoal.find({ partnerId, isDeleted: { $ne: true } }).sort({ dueDate: 1 }).limit(limit).lean(),
            PartnerGoal.countDocuments({ partnerId, isDeleted: { $ne: true } })
        ]);
        // Dynamically update currentValue from real data
        const totalStudents = await PartnerStudent.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const totalPrograms = await PartnerProgram.countDocuments({ partnerId, isDeleted: { $ne: true } });
        const latestMonth = await PartnerRevenue.findOne({ partnerId }).sort({ month: -1 }).lean();
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const updatedGoals = goals.map((g: any) => {
            let currentValue = g.currentValue;
            if (g.goalName.toLowerCase().includes('student')) currentValue = totalStudents;
            else if (g.goalName.toLowerCase().includes('revenue')) currentValue = latestMonth?.revenue || g.currentValue;
            else if (g.goalName.toLowerCase().includes('program')) currentValue = totalPrograms;
            else if (g.goalName.toLowerCase().includes('satisfaction')) currentValue = profile?.rating || g.currentValue;
            const progress = g.targetValue > 0 ? Math.min(Math.round((currentValue / g.targetValue) * 100), 100) : 0;
            return { goalId: g._id, goalName: g.goalName, targetValue: g.targetValue, currentValue, progress, status: g.status, dueDate: g.dueDate };
        });
        return { goals: updatedGoals, total };
    }

    async getOpportunityAnalysis(partnerId: string, filters?: any): Promise<any> {
        return {
            opportunities: [
                { opportunityId: 'OPP-001', title: 'Corporate Wellness Program', description: 'Partner with local businesses', potentialRevenue: 25000, difficulty: 'medium', timeframe: '3 months', recommendations: ['Prepare proposal', 'Hire trainer'] },
            ], total: 1
        };
    }

    async exportAnalyticsReport(partnerId: string, format: string): Promise<any> {
        return { success: true, message: `Report exported as ${format}`, url: `/exports/report-${Date.now()}.${format}` };
    }

    // ===== Commissions =====

    async getCommissions(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const query: any = { partnerId, isDeleted: { $ne: true } };
        if (filters?.status) query.status = filters.status;
        const limit = filters?.limit ? parseInt(filters.limit) : 100;
        const page = filters?.page ? parseInt(filters.page) : 1;
        const skip = (page - 1) * limit;
        const [commissions, total] = await Promise.all([
            PartnerCommission.find(query).sort({ calculatedAt: -1 }).skip(skip).limit(limit).lean(),
            PartnerCommission.countDocuments(query)
        ]);
        return { commissions: commissions.map((c: any) => ({ id: c._id, ...c })), total };
    }

    async getCommissionById(id: string): Promise<any> {
        const commission = await PartnerCommission.findById(id).lean();
        if (!commission) return null;
        return { id: (commission as any)._id, ...commission };
    }

    async calculateCommission(data: any): Promise<any> {
        const partnerId = data.partnerId;
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const rate = profile?.commissionRate || 15;
        const revenue = data.revenue || 0;
        const amount = Math.round(revenue * rate / 100);
        const deductions = Math.round(amount * 0.012);
        const netCommission = amount - deductions;

        // Save the calculated commission
        const commission = await PartnerCommission.create({
            partnerId,
            amount: netCommission,
            rate,
            period: data.period || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            status: 'pending',
            calculatedAt: new Date(),
        });

        return {
            id: commission._id,
            totalRevenue: revenue,
            commissionRate: rate,
            commissionAmount: amount,
            deductions,
            netCommission,
            breakdown: [{ category: 'Programs', amount: netCommission }],
        };
    }

    async getCommissionHistory(partnerId: string, filters?: any): Promise<any> {
        await this.ensureSeeded(partnerId);
        const query: any = { partnerId, isDeleted: { $ne: true } };
        if (filters?.startDate || filters?.endDate) {
            query.calculatedAt = {};
            if (filters.startDate) query.calculatedAt.$gte = new Date(filters.startDate);
            if (filters.endDate) query.calculatedAt.$lte = new Date(filters.endDate);
        }
        const limit = filters?.limit ? parseInt(filters.limit) : 50;
        const page = filters?.page ? parseInt(filters.page) : 1;
        const skip = (page - 1) * limit;
        const [history, total] = await Promise.all([
            PartnerCommission.find(query).sort({ calculatedAt: -1 }).skip(skip).limit(limit).lean(),
            PartnerCommission.countDocuments(query)
        ]);
        return { history: history.map((c: any) => ({ id: c._id, ...c })), total };
    }

    async getCommissionStats(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const commissions = await PartnerCommission.find({ partnerId, isDeleted: { $ne: true } }).lean();
        const totalCommissions = commissions.reduce((s, c) => s + (c.amount || 0), 0);
        const paidCommissions = commissions.filter(c => c.status === 'paid');
        const pendingCommissions = commissions.filter(c => c.status === 'pending');
        const totalPaid = paidCommissions.reduce((s, c) => s + (c.amount || 0), 0);
        const totalPending = pendingCommissions.reduce((s, c) => s + (c.amount || 0), 0);
        const amounts = commissions.map(c => c.amount || 0);
        return {
            totalCommissions, totalPaid, totalPending,
            commissionCount: commissions.length,
            paidCount: paidCommissions.length,
            pendingCount: pendingCommissions.length,
            averageCommission: commissions.length > 0 ? Math.round((totalCommissions / commissions.length) * 100) / 100 : 0,
            highestCommission: amounts.length > 0 ? Math.max(...amounts) : 0,
            lowestCommission: amounts.length > 0 ? Math.min(...amounts) : 0
        };
    }

    async getCommissionBreakdown(partnerId: string, period: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const profile = await PartnerProfile.findOne({ partnerId }).lean();
        const commissionRate = profile?.commissionRate || 15;
        const programs = await PartnerProgram.find({ partnerId, isDeleted: { $ne: true } }).lean();
        const totalRevenue = programs.reduce((s, p) => s + (p.revenue || 0), 0);
        const commissionAmount = Math.round(totalRevenue * commissionRate / 100);
        const deductions = Math.round(commissionAmount * 0.012);
        const netCommission = commissionAmount - deductions;
        const categoryMap: Record<string, number> = {};
        programs.forEach(p => {
            const cat = p.category || 'Other';
            const catCommission = Math.round((p.revenue || 0) * commissionRate / 100);
            categoryMap[cat] = (categoryMap[cat] || 0) + catCommission;
        });
        const breakdown = Object.entries(categoryMap).map(([category, amount]) => ({ category: `${category} Programs`, amount }));
        return { totalRevenue, commissionRate, commissionAmount, deductions, netCommission, breakdown };
    }

    async requestCommissionPayout(data: any): Promise<any> {
        const { partnerId, amount, method, notes, bankDetails, paypalEmail, upiId } = data;

        // Verify pending amount
        const pendingCommissions = await PartnerCommission.find({
            partnerId,
            status: 'pending',
            isDeleted: { $ne: true }
        }).lean();
        const totalPending = pendingCommissions.reduce((s, c) => s + (c.amount || 0), 0);

        if (amount > totalPending) {
            throw new Error(`Requested amount ($${amount}) exceeds pending commissions ($${totalPending})`);
        }

        // Create the payout request
        const payout = await PartnerPayout.create({
            partnerId,
            amount,
            method: method || 'bank_transfer',
            status: 'pending',
            notes,
            bankDetails,
            paypalEmail,
            upiId,
            requestedAt: new Date(),
        });

        return {
            id: payout._id,
            partnerId: payout.partnerId,
            amount: payout.amount,
            method: payout.method,
            status: payout.status,
            notes: payout.notes,
            requestedAt: payout.requestedAt,
        };
    }

    async getPayoutHistory(partnerId: string, filters?: any): Promise<any> {
        const query: any = { partnerId, isDeleted: { $ne: true } };
        if (filters?.status) query.status = filters.status;
        const limit = filters?.limit ? parseInt(filters.limit) : 50;
        const page = filters?.page ? parseInt(filters.page) : 1;
        const skip = (page - 1) * limit;
        const [payouts, total] = await Promise.all([
            PartnerPayout.find(query).sort({ requestedAt: -1 }).skip(skip).limit(limit).lean(),
            PartnerPayout.countDocuments(query)
        ]);
        return {
            payouts: payouts.map((p: any) => ({
                id: p._id,
                partnerId: p.partnerId,
                amount: p.amount,
                method: p.method,
                status: p.status,
                notes: p.notes,
                requestedAt: p.requestedAt,
                processedAt: p.processedAt,
                reference: p.reference,
            })),
            total,
        };
    }

    async getPayoutStatus(payoutId: string): Promise<any> {
        const payout = await PartnerPayout.findById(payoutId).lean();
        if (!payout) return null;
        return {
            id: (payout as any)._id,
            partnerId: payout.partnerId,
            amount: payout.amount,
            method: payout.method,
            status: payout.status,
            requestedAt: payout.requestedAt,
            processedAt: payout.processedAt,
            reference: payout.reference,
        };
    }

    async getCommissionRates(): Promise<any[]> {
        // Rates are tier-based configuration - stored as business rules
        const profiles = await PartnerProfile.find({ isDeleted: { $ne: true } }).lean();
        const tierRates: Record<string, { count: number; totalRate: number }> = {};
        profiles.forEach(p => {
            const tier = p.tier || 'bronze';
            if (!tierRates[tier]) tierRates[tier] = { count: 0, totalRate: 0 };
            tierRates[tier].count++;
            tierRates[tier].totalRate += p.commissionRate || 10;
        });

        return [
            { id: 'CR-001', tier: 'bronze', baseRate: 10, minRevenue: 0, maxRevenue: 10000, effectiveFrom: '2024-01-01' },
            { id: 'CR-002', tier: 'silver', baseRate: 12, minRevenue: 10001, maxRevenue: 25000, effectiveFrom: '2024-01-01' },
            { id: 'CR-003', tier: 'gold', baseRate: 15, minRevenue: 25001, maxRevenue: 50000, effectiveFrom: '2024-01-01' },
            { id: 'CR-004', tier: 'platinum', baseRate: 20, bonusRate: 5, minRevenue: 50001, effectiveFrom: '2024-01-01' },
        ];
    }

    async getCommissionTiers(): Promise<any[]> {
        return [
            { tier: 'bronze', minRevenue: 0, maxRevenue: 10000, rate: 10, benefits: ['Basic dashboard', 'Email support'] },
            { tier: 'silver', minRevenue: 10001, maxRevenue: 25000, rate: 12, benefits: ['Advanced analytics', 'Priority support'] },
            { tier: 'gold', minRevenue: 25001, maxRevenue: 50000, rate: 15, benefits: ['Full analytics', 'Dedicated manager'] },
            { tier: 'platinum', minRevenue: 50001, rate: 20, benefits: ['Everything in Gold', 'Custom integrations'] },
        ];
    }

    async getCommissionForecasts(partnerId: string, months?: number): Promise<any[]> {
        await this.ensureSeeded(partnerId);
        const monthCount = months || 3;
        const recentCommissions = await PartnerCommission.find({
            partnerId, isDeleted: { $ne: true }
        }).sort({ calculatedAt: -1 }).limit(6).lean();

        if (recentCommissions.length === 0) return [];

        const avgAmount = recentCommissions.reduce((s, c) => s + (c.amount || 0), 0) / recentCommissions.length;
        const avgRate = recentCommissions[0]?.rate || 15;
        const avgRevenue = avgRate > 0 ? Math.round(avgAmount / (avgRate / 100)) : 0;

        const forecasts = [];
        const now = new Date();
        for (let i = 1; i <= monthCount; i++) {
            const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const monthName = futureDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            const variance = 1 + (Math.random() * 0.1 - 0.05); // ±5% variance
            const projectedRevenue = Math.round(avgRevenue * variance);
            const projectedCommission = Math.round(projectedRevenue * avgRate / 100);
            const confidence = Math.max(50, 90 - (i * 5));
            forecasts.push({ month: monthName, projectedRevenue, projectedCommission, confidence });
        }
        return forecasts;
    }

    async exportCommissionReport(partnerId: string, format: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const commissions = await PartnerCommission.find({ partnerId, isDeleted: { $ne: true } }).sort({ calculatedAt: -1 }).lean();
        const stats = await this.getCommissionStats(partnerId);
        return {
            success: true,
            data: {
                commissions: commissions.map((c: any) => ({ id: c._id, ...c })),
                stats,
                exportedAt: new Date(),
                format,
            }
        };
    }

    async getCommissionComparison(partnerId: string, period: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const commissions = await PartnerCommission.find({ partnerId, isDeleted: { $ne: true } }).sort({ calculatedAt: -1 }).lean();

        // Split into two halves for comparison
        const mid = Math.ceil(commissions.length / 2);
        const currentPeriodCommissions = commissions.slice(0, mid);
        const previousPeriodCommissions = commissions.slice(mid);

        const currentRevenue = currentPeriodCommissions.reduce((s, c) => s + (c.amount || 0), 0);
        const previousRevenue = previousPeriodCommissions.reduce((s, c) => s + (c.amount || 0), 0);
        const revenueChange = previousRevenue > 0 ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 1000) / 10 : 0;

        return {
            currentPeriod: { revenue: currentRevenue, commission: currentRevenue, count: currentPeriodCommissions.length },
            previousPeriod: { revenue: previousRevenue, commission: previousRevenue, count: previousPeriodCommissions.length },
            change: { revenue: revenueChange, commission: revenueChange },
        };
    }

    // ===== Marketing =====

    async getMarketingCampaigns(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const campaigns = await PartnerCampaign.find({ partnerId, isDeleted: { $ne: true } }).sort({ startDate: -1 }).lean();
        return {
            campaigns: campaigns.map((c: any) => ({
                id: c._id.toString(), partnerId: c.partnerId,
                name: c.name, type: c.type, status: c.status,
                budget: c.budget || 0, spent: c.spent || 0,
                impressions: c.impressions || 0, clicks: c.clicks || 0,
                conversions: c.conversions || 0, roi: c.roi || 0,
                startDate: c.startDate, endDate: c.endDate, createdAt: c.createdAt
            })),
            total: campaigns.length
        };
    }

    async getMarketingLeads(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const leads = await PartnerLead.find({ partnerId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
        return {
            leads: leads.map((l: any) => ({
                id: l._id.toString(), partnerId: l.partnerId,
                name: l.name, email: l.email, phone: l.phone || '',
                source: l.source || '', status: l.status,
                interestLevel: l.interestLevel, createdAt: l.createdAt
            })),
            total: leads.length
        };
    }

    // ===== Integrations =====

    async getIntegrations(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const integrations = await PartnerIntegration.find({ partnerId, isDeleted: { $ne: true } }).lean();
        return {
            integrations: integrations.map((i: any) => ({
                id: i._id.toString(), partnerId: i.partnerId,
                name: i.name, description: i.description || '',
                category: i.category || '', type: i.type || '',
                status: i.status, iconName: i.iconName || 'Zap',
                color: i.color || 'text-gray-600', bgColor: i.bgColor || 'bg-gray-50',
                lastSync: i.lastSync, syncFrequency: i.syncFrequency || 'Manual',
                dataPointsSynced: i.dataPoints || 0, healthScore: i.health || 0,
                createdAt: i.createdAt
            })),
            total: integrations.length
        };
    }

    async toggleIntegration(integrationId: string, enabled: boolean): Promise<any> {
        const newStatus = enabled ? 'connected' : 'disconnected';
        const updated = await PartnerIntegration.findByIdAndUpdate(
            integrationId,
            { $set: { status: newStatus, updatedAt: new Date() } },
            { new: true }
        ).lean();
        if (!updated) return { id: integrationId, status: newStatus, updatedAt: new Date() };
        return { id: (updated as any)._id.toString(), status: (updated as any).status, updatedAt: new Date() };
    }

    // ===== Support Tickets =====

    async getSupportTickets(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const tickets = await PartnerTicket.find({ partnerId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
        return {
            tickets: tickets.map((t: any) => ({
                id: t._id.toString(), partnerId: t.partnerId,
                subject: t.subject, description: t.description || '',
                status: t.status, priority: t.priority,
                category: t.category || '', assignedTo: t.assignedTo || 'Support Team',
                messages: (t.messages || []).map((m: any, idx: number) => ({
                    id: `${t._id}-msg-${idx}`, ticketId: t._id.toString(),
                    sender: m.sender, senderType: m.senderType,
                    message: m.message, createdAt: m.createdAt
                })),
                createdAt: t.createdAt, updatedAt: t.updatedAt, resolvedAt: t.resolvedAt
            })),
            total: tickets.length
        };
    }

    async createSupportTicket(partnerId: string, data: any): Promise<any> {
        const ticket = await PartnerTicket.create({
            partnerId,
            subject: data.subject,
            description: data.description || '',
            status: 'open',
            priority: data.priority || 'medium',
            category: data.category || 'General',
            assignedTo: 'Support Team',
            messages: [{
                sender: 'Partner Admin',
                senderType: 'partner',
                message: data.description,
                createdAt: new Date()
            }],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return {
            id: (ticket as any)._id.toString(),
            partnerId,
            subject: data.subject,
            description: data.description,
            status: 'open',
            priority: data.priority || 'medium',
            category: data.category || 'General',
            createdAt: (ticket as any).createdAt
        };
    }

    async addTicketMessage(ticketId: string, data: any): Promise<any> {
        const newMessage = {
            sender: data.sender || 'Partner Admin',
            senderType: data.senderType || 'partner',
            message: data.message,
            createdAt: new Date()
        };
        await PartnerTicket.findByIdAndUpdate(
            ticketId,
            { $push: { messages: newMessage }, $set: { updatedAt: new Date() } }
        );
        return { id: `${ticketId}-msg-${Date.now()}`, ticketId, ...newMessage };
    }

    // ===== Messages & Communication =====

    async getMessages(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const messages = await PartnerMessage.find({ partnerId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
        return {
            messages: messages.map((m: any) => ({
                id: m._id.toString(), partnerId: m.partnerId,
                from: m.from, fromType: m.fromType,
                subject: m.subject, body: m.body,
                isRead: m.isRead, isArchived: m.isArchived || false,
                starred: m.starred || false, priority: m.priority || 'MEDIUM',
                replies: (m.replies || []).map((r: any, idx: number) => ({
                    id: `${m._id}-rpl-${idx}`, sender: r.sender,
                    message: r.message, createdAt: r.createdAt
                })),
                createdAt: m.createdAt
            })),
            total: messages.length
        };
    }

    async sendMessage(partnerId: string, data: any): Promise<any> {
        const message = await PartnerMessage.create({
            partnerId,
            from: data.from || 'Partner Admin',
            fromType: data.fromType || 'partner',
            subject: data.subject,
            body: data.body,
            isRead: false,
            priority: data.priority || 'MEDIUM',
            replies: []
        });
        const m: any = message.toObject();
        return { id: m._id.toString(), partnerId: m.partnerId, from: m.from, fromType: m.fromType, subject: m.subject, body: m.body, isRead: m.isRead, priority: m.priority, replies: [], createdAt: m.createdAt };
    }

    async replyToMessage(messageId: string, data: any): Promise<any> {
        const newReply = { sender: data.sender || 'Partner Admin', message: data.message, createdAt: new Date() };
        await PartnerMessage.findByIdAndUpdate(
            messageId,
            { $push: { replies: newReply } }
        );
        return { id: `${messageId}-rpl-${Date.now()}`, messageId, ...newReply };
    }

    // ===== Settings =====

    async getPartnerSettings(partnerId: string): Promise<any> {
        await this.ensureSeeded(partnerId);
        const settings = await PartnerSettings.findOne({ partnerId }).lean();
        if (settings) {
            const s: any = settings;
            return {
                partnerId: s.partnerId,
                profile: s.profile || {},
                billing: s.billing || {},
                api: s.api || {},
                notifications: s.notifications || {}
            };
        }
        // Return defaults if not found
        return {
            partnerId,
            profile: { organizationName: '', contactPerson: '', email: '', phone: '', website: '', address: '' },
            billing: { billingEmail: '', paymentMethod: '', billingAddress: '', taxId: '' },
            api: { apiKey: '', webhookUrl: '', environment: 'production' },
            notifications: { emailNotifications: true, smsNotifications: false, webhookNotifications: true, dailyDigest: true, weeklyReport: true }
        };
    }

    async updatePartnerSettings(partnerId: string, data: any): Promise<any> {
        const updated = await PartnerSettings.findOneAndUpdate(
            { partnerId },
            { $set: { ...data, partnerId, updatedAt: new Date() } },
            { new: true, upsert: true, runValidators: false }
        ).lean();
        const s: any = updated;
        return {
            partnerId: s.partnerId,
            profile: s.profile || {},
            billing: s.billing || {},
            api: s.api || {},
            notifications: s.notifications || {},
            updatedAt: s.updatedAt
        };
    }

    // ===== Partner Reports =====

    async getPartnerReports(partnerId: string, filters: { period?: string; status?: string; reportType?: string }): Promise<any> {
        const now = new Date();
        let dateFrom = new Date();

        switch (filters.period) {
            case 'weekly':
                dateFrom.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                dateFrom.setMonth(now.getMonth() - 1);
                break;
            case 'quarterly':
                dateFrom.setMonth(now.getMonth() - 3);
                break;
            case 'yearly':
                dateFrom.setFullYear(now.getFullYear() - 1);
                break;
            default:
                dateFrom.setMonth(now.getMonth() - 1);
        }

        try {
            const query: any = { businessUnitId: partnerId };
            if (filters.status) query.status = filters.status;
            if (filters.reportType) query.reportType = filters.reportType;
            query.createdAt = { $gte: dateFrom };

            const Report = mongoose.models.Report;
            if (Report) {
                const reports = await Report.find(query).sort({ createdAt: -1 });
                if (reports.length > 0) {
                    return { reports, total: reports.length };
                }
            }
        } catch (e) {
            // Fall through to seed data
        }

        // Return seed data for the partner
        const seedReports = this.getPartnerSeedReports(partnerId, filters.period || 'monthly');
        let filtered = seedReports;
        if (filters.status) {
            filtered = filtered.filter((r: any) => r.status === filters.status);
        }
        if (filters.reportType) {
            filtered = filtered.filter((r: any) => r.reportType === filters.reportType);
        }
        return { reports: filtered, total: filtered.length };
    }

    async getPartnerReportsSummary(partnerId: string, period?: string): Promise<any> {
        const reportsData = await this.getPartnerReports(partnerId, { period: period || 'monthly' });
        const reports = reportsData.reports;

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalReports = reports.length;
        const completedReports = reports.filter((r: any) => r.status === 'active' || r.status === 'completed').length;
        const pendingReports = reports.filter((r: any) => r.status === 'draft' || r.status === 'pending').length;
        const thisMonthReports = reports.filter((r: any) => new Date(r.createdAt) >= thisMonthStart).length;

        // Period-specific stats
        const periodLabel = period || 'monthly';
        const reportsByType: Record<string, number> = {};
        reports.forEach((r: any) => {
            reportsByType[r.reportType] = (reportsByType[r.reportType] || 0) + 1;
        });

        return {
            totalReports,
            completedReports,
            pendingReports,
            thisMonthReports,
            period: periodLabel,
            reportsByType,
            recentReports: reports.slice(0, 5)
        };
    }

    async createPartnerReport(partnerId: string, data: any, userId: string): Promise<any> {
        const reportId = `RPT-${Date.now()}`;
        const now = new Date();

        // Try to save to DB
        try {
            const Report = mongoose.models.Report;
            if (Report) {
                const report = new Report({
                    reportId,
                    reportType: data.reportType || 'custom',
                    reportName: data.reportName,
                    description: data.description || '',
                    config: {
                        dataSource: data.dataSources || ['partner-data'],
                        filters: { partnerId },
                        groupBy: data.groupBy || [],
                        aggregations: {},
                        dateRange: {
                            from: data.dateFrom ? new Date(data.dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1),
                            to: data.dateTo ? new Date(data.dateTo) : now
                        }
                    },
                    format: data.format || 'pdf',
                    status: 'active',
                    businessUnitId: partnerId,
                    createdBy: userId,
                    createdAt: now,
                    updatedAt: now
                });
                const saved = await report.save();
                return saved;
            }
        } catch (e) {
            // Fall through
        }

        // Return in-memory report
        return {
            reportId,
            reportType: data.reportType || 'custom',
            reportName: data.reportName,
            description: data.description || '',
            format: data.format || 'pdf',
            status: 'active',
            businessUnitId: partnerId,
            config: {
                dateRange: {
                    from: data.dateFrom || new Date(now.getFullYear(), now.getMonth(), 1),
                    to: data.dateTo || now
                }
            },
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
            result: {
                fileUrl: `/reports/${reportId}.${data.format || 'pdf'}`,
                fileSize: Math.floor(Math.random() * 5000000) + 500000,
                recordCount: Math.floor(Math.random() * 500) + 50,
                generatedAt: now
            }
        };
    }

    async getPartnerReportById(partnerId: string, reportId: string): Promise<any> {
        try {
            const Report = mongoose.models.Report;
            if (Report) {
                const report = await Report.findOne({ reportId, businessUnitId: partnerId });
                if (report) return report;
            }
        } catch (e) { /* fall through */ }

        const seedReports = this.getPartnerSeedReports(partnerId, 'yearly');
        const found = seedReports.find((r: any) => r.reportId === reportId);
        if (found) return found;
        throw new Error('Report not found');
    }

    async deletePartnerReport(partnerId: string, reportId: string): Promise<void> {
        try {
            const Report = mongoose.models.Report;
            if (Report) {
                await Report.findOneAndUpdate({ reportId, businessUnitId: partnerId }, { status: 'archived' });
                return;
            }
        } catch (e) { /* fall through */ }
    }

    async downloadPartnerReport(partnerId: string, reportId: string): Promise<any> {
        const report = await this.getPartnerReportById(partnerId, reportId);
        return {
            reportId: report.reportId,
            reportName: report.reportName,
            format: report.format,
            fileUrl: report.result?.fileUrl || `/reports/${reportId}.${report.format || 'pdf'}`,
            fileSize: report.result?.fileSize || 1024000,
            generatedAt: report.result?.generatedAt || report.createdAt
        };
    }

    private getPartnerSeedReports(partnerId: string, period: string): any[] {
        const now = new Date();
        const reports = [
            {
                reportId: 'RPT-SEED-001',
                reportType: 'performance',
                reportName: 'Student Progress Report - Q1 2026',
                description: 'Comprehensive student progress and achievement analysis for Q1',
                format: 'pdf',
                status: 'active',
                businessUnitId: partnerId,
                config: { dateRange: { from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) } },
                createdBy: 'system',
                createdAt: new Date(now.getTime() - 2 * 86400000),
                updatedAt: new Date(now.getTime() - 2 * 86400000),
                result: { fileUrl: '/reports/RPT-SEED-001.pdf', fileSize: 2457600, recordCount: 156, generatedAt: new Date(now.getTime() - 2 * 86400000) }
            },
            {
                reportId: 'RPT-SEED-002',
                reportType: 'financial',
                reportName: 'Financial Summary - March 2026',
                description: 'Monthly revenue, commissions, and financial metrics breakdown',
                format: 'excel',
                status: 'active',
                businessUnitId: partnerId,
                config: { dateRange: { from: new Date(2026, 2, 1), to: new Date(2026, 2, 31) } },
                createdBy: 'system',
                createdAt: new Date(now.getTime() - 5 * 86400000),
                updatedAt: new Date(now.getTime() - 5 * 86400000),
                result: { fileUrl: '/reports/RPT-SEED-002.xlsx', fileSize: 1843200, recordCount: 89, generatedAt: new Date(now.getTime() - 5 * 86400000) }
            },
            {
                reportId: 'RPT-SEED-003',
                reportType: 'attendance',
                reportName: 'Attendance Analytics Report',
                description: 'Weekly attendance patterns and engagement metrics',
                format: 'pdf',
                status: 'active',
                businessUnitId: partnerId,
                config: { dateRange: { from: new Date(now.getTime() - 7 * 86400000), to: now } },
                createdBy: 'system',
                createdAt: new Date(now.getTime() - 1 * 86400000),
                updatedAt: new Date(now.getTime() - 1 * 86400000),
                result: { fileUrl: '/reports/RPT-SEED-003.pdf', fileSize: 1024000, recordCount: 312, generatedAt: new Date(now.getTime() - 1 * 86400000) }
            },
            {
                reportId: 'RPT-SEED-004',
                reportType: 'operations',
                reportName: 'Program Performance Overview',
                description: 'Program enrollment rates, completion metrics and success analysis',
                format: 'pdf',
                status: 'active',
                businessUnitId: partnerId,
                config: { dateRange: { from: new Date(2026, 0, 1), to: now } },
                createdBy: 'system',
                createdAt: new Date(now.getTime() - 10 * 86400000),
                updatedAt: new Date(now.getTime() - 10 * 86400000),
                result: { fileUrl: '/reports/RPT-SEED-004.pdf', fileSize: 3145728, recordCount: 45, generatedAt: new Date(now.getTime() - 10 * 86400000) }
            },
            {
                reportId: 'RPT-SEED-005',
                reportType: 'financial',
                reportName: 'Commission Statement - February 2026',
                description: 'Detailed commission breakdown and payment summary',
                format: 'csv',
                status: 'active',
                businessUnitId: partnerId,
                config: { dateRange: { from: new Date(2026, 1, 1), to: new Date(2026, 1, 28) } },
                createdBy: 'system',
                createdAt: new Date(now.getTime() - 25 * 86400000),
                updatedAt: new Date(now.getTime() - 25 * 86400000),
                result: { fileUrl: '/reports/RPT-SEED-005.csv', fileSize: 512000, recordCount: 234, generatedAt: new Date(now.getTime() - 25 * 86400000) }
            },
            {
                reportId: 'RPT-SEED-006',
                reportType: 'custom',
                reportName: 'Partnership Agreement 2024',
                description: 'Annual partnership agreement and compliance documentation',
                format: 'pdf',
                status: 'active',
                businessUnitId: partnerId,
                config: { dateRange: { from: new Date(2024, 0, 15), to: new Date(2024, 11, 31) } },
                createdBy: 'system',
                createdAt: new Date(2024, 0, 15),
                updatedAt: new Date(2024, 0, 15),
                result: { fileUrl: '/reports/RPT-SEED-006.pdf', fileSize: 2457600, recordCount: 1, generatedAt: new Date(2024, 0, 15) }
            },
            {
                reportId: 'RPT-SEED-007',
                reportType: 'performance',
                reportName: 'Weekly Performance Snapshot',
                description: 'Quick weekly performance metrics for current week',
                format: 'pdf',
                status: 'draft',
                businessUnitId: partnerId,
                config: { dateRange: { from: new Date(now.getTime() - 7 * 86400000), to: now } },
                createdBy: 'system',
                createdAt: new Date(now.getTime() - 3600000),
                updatedAt: new Date(now.getTime() - 3600000),
                result: null
            }
        ];

        return reports;
    }
}