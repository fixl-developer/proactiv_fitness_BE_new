import { FilterQuery } from 'mongoose';
import { ChildProfile, FamilyProfile, Inquiry, LeadManagement } from './crm.model';
import {
    IChildProfile,
    IFamilyProfile,
    IInquiry,
    ILeadManagement,
    IFamilyFilter,
    IChildFilter,
    IInquiryFilter,
    ICreateFamilyRequest,
    ICreateChildRequest,
    ICreateInquiryRequest,
    ICommunicationRequest,
    IFamilyStatistics,
    IInquiryStatistics,
    FamilyStatus,
    InquiryStatus,
    LeadSource
} from './crm.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class FamilyService extends BaseService<IFamilyProfile> {
    constructor() {
        super(FamilyProfile);
    }

    /**
     * Create new family with primary parent
     */
    async createFamily(familyData: ICreateFamilyRequest, createdBy: string): Promise<IFamilyProfile> {
        try {
            // Generate unique family code
            const familyCode = await this.generateFamilyCode();

            const family = new FamilyProfile({
                familyName: familyData.familyName,
                familyCode,
                primaryEmail: familyData.primaryEmail,
                primaryPhone: familyData.primaryPhone,
                businessUnitId: familyData.businessUnitId,
                locationIds: familyData.locationIds,
                addresses: familyData.address ? [{ ...familyData.address, isDefault: true }] : [],
                marketingConsent: {
                    email: true,
                    sms: false,
                    phone: false,
                    postal: false,
                    consentDate: new Date()
                },
                createdBy,
                updatedBy: createdBy
            });

            await family.save();
            return family;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create family',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add family member
     */
    async addFamilyMember(
        familyId: string,
        memberData: any,
        addedBy: string
    ): Promise<IFamilyProfile> {
        try {
            const family = await this.findById(familyId);
            if (!family) {
                throw new AppError('Family not found', HTTP_STATUS.NOT_FOUND);
            }

            family.members.push({
                ...memberData,
                addedAt: new Date()
            });

            family.updatedBy = addedBy;
            await family.save();

            return family;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add family member',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update family status
     */
    async updateFamilyStatus(
        familyId: string,
        status: FamilyStatus,
        updatedBy: string
    ): Promise<IFamilyProfile> {
        try {
            const family = await this.update(familyId, { status, updatedBy });
            return family;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update family status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add communication log
     */
    async addCommunicationLog(
        familyId: string,
        communication: any,
        addedBy: string
    ): Promise<IFamilyProfile> {
        try {
            const family = await this.findById(familyId);
            if (!family) {
                throw new AppError('Family not found', HTTP_STATUS.NOT_FOUND);
            }

            family.communicationLog.push(communication);
            family.updatedBy = addedBy;
            await family.save();

            return family;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add communication log',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get family statistics
     */
    async getFamilyStatistics(businessUnitId?: string): Promise<IFamilyStatistics> {
        try {
            const matchStage: any = {};
            if (businessUnitId) {
                matchStage.businessUnitId = businessUnitId;
            }

            const stats = await FamilyProfile.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalFamilies: { $sum: 1 },
                        activeFamilies: {
                            $sum: { $cond: [{ $eq: ['$status', FamilyStatus.ACTIVE] }, 1, 0] }
                        },
                        totalAccountBalance: { $sum: '$accountBalance' },
                        averageAccountBalance: { $avg: '$accountBalance' },
                        familiesByStatus: {
                            $push: '$status'
                        }
                    }
                }
            ]);

            const childStats = await ChildProfile.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalChildren: { $sum: 1 },
                        activeChildren: { $sum: 1 }
                    }
                }
            ]);

            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const newFamiliesThisMonth = await FamilyProfile.countDocuments({
                ...matchStage,
                createdAt: { $gte: thisMonth }
            });

            const familiesByStatus = stats[0]?.familiesByStatus || [];
            const statusCounts = familiesByStatus.reduce((acc: any, status: string) => {
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            return {
                totalFamilies: stats[0]?.totalFamilies || 0,
                activeFamilies: stats[0]?.activeFamilies || 0,
                newFamiliesThisMonth,
                averageChildrenPerFamily: stats[0]?.totalFamilies > 0
                    ? (childStats[0]?.totalChildren || 0) / stats[0].totalFamilies
                    : 0,
                totalChildren: childStats[0]?.totalChildren || 0,
                activeChildren: childStats[0]?.activeChildren || 0,
                familiesByStatus: statusCounts,
                averageAccountBalance: stats[0]?.averageAccountBalance || 0,
                totalAccountBalance: stats[0]?.totalAccountBalance || 0
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get family statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async generateFamilyCode(): Promise<string> {
        let code: string;
        let exists = true;

        while (exists) {
            code = `FAM${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const existing = await FamilyProfile.findOne({ familyCode: code });
            exists = !!existing;
        }

        return code!;
    }
}

export class ChildService extends BaseService<IChildProfile> {
    constructor() {
        super(ChildProfile);
    }

    /**
     * Create child profile
     */
    async createChild(childData: ICreateChildRequest, createdBy: string): Promise<IChildProfile> {
        try {
            const child = new ChildProfile({
                ...childData,
                mediaConsent: {
                    ...childData.mediaConsent,
                    consentDate: new Date(),
                    consentBy: createdBy
                },
                createdBy,
                updatedBy: createdBy
            });

            await child.save();

            // Add child to family
            await FamilyProfile.findByIdAndUpdate(
                childData.familyId,
                {
                    $push: { children: child._id },
                    $set: { updatedBy: createdBy }
                }
            );

            return child;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create child profile',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add medical flag
     */
    async addMedicalFlag(
        childId: string,
        medicalFlag: any,
        addedBy: string
    ): Promise<IChildProfile> {
        try {
            const child = await this.findById(childId);
            if (!child) {
                throw new AppError('Child not found', HTTP_STATUS.NOT_FOUND);
            }

            child.medicalFlags.push(medicalFlag);
            child.updatedBy = addedBy;
            await child.save();

            return child;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add medical flag',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add behavioral note
     */
    async addBehavioralNote(
        childId: string,
        note: any,
        addedBy: string
    ): Promise<IChildProfile> {
        try {
            const child = await this.findById(childId);
            if (!child) {
                throw new AppError('Child not found', HTTP_STATUS.NOT_FOUND);
            }

            child.behavioralNotes.push({
                ...note,
                createdBy: addedBy,
                createdAt: new Date()
            });

            child.updatedBy = addedBy;
            await child.save();

            return child;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add behavioral note',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update skill level
     */
    async updateSkillLevel(
        childId: string,
        skill: string,
        level: string,
        updatedBy: string
    ): Promise<IChildProfile> {
        try {
            const child = await this.findById(childId);
            if (!child) {
                throw new AppError('Child not found', HTTP_STATUS.NOT_FOUND);
            }

            child.skillLevels.set(skill, level);
            child.updatedBy = updatedBy;
            await child.save();

            return child;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update skill level',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add achievement
     */
    async addAchievement(
        childId: string,
        achievement: any,
        addedBy: string
    ): Promise<IChildProfile> {
        try {
            const child = await this.findById(childId);
            if (!child) {
                throw new AppError('Child not found', HTTP_STATUS.NOT_FOUND);
            }

            child.achievements.push(achievement);
            child.updatedBy = addedBy;
            await child.save();

            return child;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add achievement',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export class InquiryService extends BaseService<IInquiry> {
    constructor() {
        super(Inquiry);
    }

    /**
     * Create inquiry
     */
    async createInquiry(inquiryData: ICreateInquiryRequest, createdBy: string): Promise<IInquiry> {
        try {
            const inquiryId = await this.generateInquiryId();

            const inquiry = new Inquiry({
                ...inquiryData,
                inquiryId,
                createdBy,
                updatedBy: createdBy
            });

            await inquiry.save();
            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create inquiry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update inquiry status
     */
    async updateInquiryStatus(
        inquiryId: string,
        status: InquiryStatus,
        updatedBy: string
    ): Promise<IInquiry> {
        try {
            const inquiry = await this.update(inquiryId, { status, updatedBy });
            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update inquiry status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Assign inquiry to staff
     */
    async assignInquiry(
        inquiryId: string,
        assignedTo: string,
        assignedBy: string
    ): Promise<IInquiry> {
        try {
            const inquiry = await this.update(inquiryId, {
                assignedTo,
                updatedBy: assignedBy
            });
            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to assign inquiry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Convert inquiry to family
     */
    async convertInquiry(
        inquiryId: string,
        familyId: string,
        convertedBy: string
    ): Promise<IInquiry> {
        try {
            const inquiry = await this.update(inquiryId, {
                status: InquiryStatus.ENROLLED,
                convertedToFamilyId: familyId,
                conversionDate: new Date(),
                updatedBy: convertedBy
            });

            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to convert inquiry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add follow-up note
     */
    async addFollowUpNote(
        inquiryId: string,
        note: string,
        nextFollowUp: Date,
        addedBy: string
    ): Promise<IInquiry> {
        try {
            const inquiry = await this.findById(inquiryId);
            if (!inquiry) {
                throw new AppError('Inquiry not found', HTTP_STATUS.NOT_FOUND);
            }

            inquiry.followUpNotes.push(note);
            inquiry.followUpDate = nextFollowUp;
            inquiry.updatedBy = addedBy;
            await inquiry.save();

            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add follow-up note',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get inquiry statistics
     */
    async getInquiryStatistics(businessUnitId?: string): Promise<IInquiryStatistics> {
        try {
            const matchStage: any = {};
            if (businessUnitId) {
                matchStage.businessUnitId = businessUnitId;
            }

            const stats = await Inquiry.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalInquiries: { $sum: 1 },
                        inquiriesByStatus: { $push: '$status' },
                        inquiriesBySource: { $push: '$source' },
                        convertedInquiries: {
                            $sum: { $cond: [{ $eq: ['$status', InquiryStatus.ENROLLED] }, 1, 0] }
                        }
                    }
                }
            ]);

            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const newInquiriesThisMonth = await Inquiry.countDocuments({
                ...matchStage,
                createdAt: { $gte: thisMonth }
            });

            const inquiriesByStatus = stats[0]?.inquiriesByStatus || [];
            const statusCounts = inquiriesByStatus.reduce((acc: any, status: string) => {
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            const inquiriesBySource = stats[0]?.inquiriesBySource || [];
            const sourceCounts = inquiriesBySource.reduce((acc: any, source: string) => {
                acc[source] = (acc[source] || 0) + 1;
                return acc;
            }, {});

            const conversionRate = stats[0]?.totalInquiries > 0
                ? (stats[0].convertedInquiries / stats[0].totalInquiries) * 100
                : 0;

            // Get top interested programs
            const topPrograms = await Inquiry.aggregate([
                { $match: matchStage },
                { $unwind: '$interestedPrograms' },
                {
                    $group: {
                        _id: '$interestedPrograms',
                        inquiryCount: { $sum: 1 }
                    }
                },
                { $sort: { inquiryCount: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'programs',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'program'
                    }
                },
                {
                    $project: {
                        programId: '$_id',
                        programName: { $arrayElemAt: ['$program.name', 0] },
                        inquiryCount: 1
                    }
                }
            ]);

            return {
                totalInquiries: stats[0]?.totalInquiries || 0,
                newInquiriesThisMonth,
                conversionRate,
                inquiriesByStatus: statusCounts,
                inquiriesBySource: sourceCounts,
                averageResponseTime: 24, // This would be calculated from actual response times
                topInterestedPrograms: topPrograms
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get inquiry statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async generateInquiryId(): Promise<string> {
        let id: string;
        let exists = true;

        while (exists) {
            id = `INQ${Date.now().toString().slice(-8)}`;
            const existing = await Inquiry.findOne({ inquiryId: id });
            exists = !!existing;
        }

        return id!;
    }
}

export class LeadService extends BaseService<ILeadManagement> {
    constructor() {
        super(LeadManagement);
    }

    /**
     * Create lead
     */
    async createLead(leadData: any, createdBy: string): Promise<ILeadManagement> {
        try {
            const leadId = await this.generateLeadId();

            const lead = new LeadManagement({
                ...leadData,
                leadId,
                createdBy,
                updatedBy: createdBy
            });

            await lead.save();
            return lead;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create lead',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update lead score
     */
    async updateLeadScore(
        leadId: string,
        scoringFactor: any,
        updatedBy: string
    ): Promise<ILeadManagement> {
        try {
            const lead = await this.findById(leadId);
            if (!lead) {
                throw new AppError('Lead not found', HTTP_STATUS.NOT_FOUND);
            }

            lead.scoringFactors.push(scoringFactor);
            lead.score = lead.scoringFactors.reduce((total, factor) => total + factor.points, 0);
            lead.updatedBy = updatedBy;
            await lead.save();

            return lead;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update lead score',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Assign lead
     */
    async assignLead(
        leadId: string,
        assignedTo: string,
        assignedBy: string
    ): Promise<ILeadManagement> {
        try {
            const lead = await this.update(leadId, {
                assignedTo,
                assignedDate: new Date(),
                updatedBy: assignedBy
            });

            return lead;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to assign lead',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async generateLeadId(): Promise<string> {
        let id: string;
        let exists = true;

        while (exists) {
            id = `LEAD${Date.now().toString().slice(-8)}`;
            const existing = await LeadManagement.findOne({ leadId: id });
            exists = !!existing;
        }

        return id!;
    }
}
