import { Request, Response } from 'express';
import { FamilyService, ChildService, InquiryService, LeadService } from './crm.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { ResponseUtil } from '../../shared/utils/response.util';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class FamilyController {
    private familyService: FamilyService;

    constructor() {
        this.familyService = new FamilyService();
    }

    /**
     * Get all families
     */
    getFamilies = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildFamilyFilters(req.query);

        const { data, total } = await this.familyService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 },
            populate: [
                { path: 'children', select: 'firstName lastName dateOfBirth isActive' },
                { path: 'businessUnitId', select: 'name' },
                { path: 'locationIds', select: 'name' }
            ]
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Families retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get family by ID
     */
    getFamilyById = asyncHandler(async (req: Request, res: Response) => {
        const family = await this.familyService.getById(req.params.id, {
            populate: [
                { path: 'children' },
                { path: 'members.userId', select: 'firstName lastName email phone' },
                { path: 'businessUnitId', select: 'name' },
                { path: 'locationIds', select: 'name address' }
            ]
        });

        if (!family) {
            throw new AppError('Family not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, family, 'Family retrieved successfully');
    });

    /**
     * Create family
     */
    createFamily = asyncHandler(async (req: Request, res: Response) => {
        const family = await this.familyService.createFamily(req.body, req.user.id);

        ResponseUtil.success(res, family, 'Family created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Update family
     */
    updateFamily = asyncHandler(async (req: Request, res: Response) => {
        const family = await this.familyService.update(
            req.params.id,
            { ...req.body, updatedBy: req.user.id }
        );

        ResponseUtil.success(res, family, 'Family updated successfully');
    });

    /**
     * Delete family
     */
    deleteFamily = asyncHandler(async (req: Request, res: Response) => {
        await this.familyService.delete(req.params.id);
        ResponseUtil.success(res, null, 'Family deleted successfully');
    });

    /**
     * Add family member
     */
    addFamilyMember = asyncHandler(async (req: Request, res: Response) => {
        const family = await this.familyService.addFamilyMember(
            req.params.id,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, family, 'Family member added successfully');
    });

    /**
     * Update family status
     */
    updateFamilyStatus = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.body;
        const family = await this.familyService.updateFamilyStatus(
            req.params.id,
            status,
            req.user.id
        );

        ResponseUtil.success(res, family, 'Family status updated successfully');
    });

    /**
     * Add communication log
     */
    addCommunicationLog = asyncHandler(async (req: Request, res: Response) => {
        const family = await this.familyService.addCommunicationLog(
            req.params.id,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, family, 'Communication log added successfully');
    });

    /**
     * Get family statistics
     */
    getFamilyStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;
        const statistics = await this.familyService.getFamilyStatistics(
            businessUnitId as string
        );

        ResponseUtil.success(res, statistics, 'Family statistics retrieved successfully');
    });

    private buildFamilyFilters(query: any) {
        const filters: any = {};

        if (query.businessUnitId) filters.businessUnitId = query.businessUnitId;
        if (query.locationId) filters.locationIds = query.locationId;
        if (query.status) filters.status = query.status;
        if (query.hasActiveChildren === 'true') {
            filters.children = { $exists: true, $not: { $size: 0 } };
        }

        if (query.minBalance || query.maxBalance) {
            filters.accountBalance = {};
            if (query.minBalance) filters.accountBalance.$gte = parseFloat(query.minBalance);
            if (query.maxBalance) filters.accountBalance.$lte = parseFloat(query.maxBalance);
        }

        if (query.lastActivityFrom || query.lastActivityTo) {
            filters.lastActivityDate = {};
            if (query.lastActivityFrom) filters.lastActivityDate.$gte = new Date(query.lastActivityFrom);
            if (query.lastActivityTo) filters.lastActivityDate.$lte = new Date(query.lastActivityTo);
        }

        if (query.searchText) {
            filters.$text = { $search: query.searchText };
        }

        return filters;
    }
}

export class ChildController {
    private childService: ChildService;

    constructor() {
        this.childService = new ChildService();
    }

    /**
     * Get all children
     */
    getChildren = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildChildFilters(req.query);

        const { data, total } = await this.childService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 },
            populate: [
                { path: 'familyId', select: 'familyName familyCode' },
                { path: 'parentIds', select: 'firstName lastName' },
                { path: 'currentPrograms', select: 'name category' }
            ]
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Children retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get child by ID
     */
    getChildById = asyncHandler(async (req: Request, res: Response) => {
        const child = await this.childService.getById(req.params.id, {
            populate: [
                { path: 'familyId' },
                { path: 'parentIds', select: 'firstName lastName email phone' },
                { path: 'currentPrograms' },
                { path: 'programHistory.programId', select: 'name category' }
            ]
        });

        if (!child) {
            throw new AppError('Child not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, child, 'Child retrieved successfully');
    });

    /**
     * Create child
     */
    createChild = asyncHandler(async (req: Request, res: Response) => {
        const child = await this.childService.createChild(req.body, req.user.id);

        ResponseUtil.success(res, child, 'Child created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Update child
     */
    updateChild = asyncHandler(async (req: Request, res: Response) => {
        const child = await this.childService.update(
            req.params.id,
            { ...req.body, updatedBy: req.user.id }
        );

        ResponseUtil.success(res, child, 'Child updated successfully');
    });

    /**
     * Delete child
     */
    deleteChild = asyncHandler(async (req: Request, res: Response) => {
        await this.childService.delete(req.params.id);
        ResponseUtil.success(res, null, 'Child deleted successfully');
    });

    /**
     * Add medical flag
     */
    addMedicalFlag = asyncHandler(async (req: Request, res: Response) => {
        const child = await this.childService.addMedicalFlag(
            req.params.id,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, child, 'Medical flag added successfully');
    });

    /**
     * Add behavioral note
     */
    addBehavioralNote = asyncHandler(async (req: Request, res: Response) => {
        const child = await this.childService.addBehavioralNote(
            req.params.id,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, child, 'Behavioral note added successfully');
    });

    /**
     * Update skill level
     */
    updateSkillLevel = asyncHandler(async (req: Request, res: Response) => {
        const { skill, level } = req.body;
        const child = await this.childService.updateSkillLevel(
            req.params.id,
            skill,
            level,
            req.user.id
        );

        ResponseUtil.success(res, child, 'Skill level updated successfully');
    });

    /**
     * Add achievement
     */
    addAchievement = asyncHandler(async (req: Request, res: Response) => {
        const child = await this.childService.addAchievement(
            req.params.id,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, child, 'Achievement added successfully');
    });

    private buildChildFilters(query: any) {
        const filters: any = {};

        if (query.familyId) filters.familyId = query.familyId;
        if (query.isActive !== undefined) filters.isActive = query.isActive === 'true';
        if (query.currentPrograms) {
            filters.currentPrograms = Array.isArray(query.currentPrograms)
                ? { $in: query.currentPrograms }
                : query.currentPrograms;
        }

        if (query.minAge || query.maxAge) {
            const today = new Date();
            if (query.maxAge) {
                const minBirthDate = new Date(today.getFullYear() - parseInt(query.maxAge) - 1, today.getMonth(), today.getDate());
                filters.dateOfBirth = { $gte: minBirthDate };
            }
            if (query.minAge) {
                const maxBirthDate = new Date(today.getFullYear() - parseInt(query.minAge), today.getMonth(), today.getDate());
                filters.dateOfBirth = { ...filters.dateOfBirth, $lte: maxBirthDate };
            }
        }

        if (query.hasMedicalFlags === 'true') {
            filters.medicalFlags = { $exists: true, $not: { $size: 0 } };
        }

        if (query.searchText) {
            filters.$text = { $search: query.searchText };
        }

        return filters;
    }
}

export class InquiryController {
    private inquiryService: InquiryService;

    constructor() {
        this.inquiryService = new InquiryService();
    }

    /**
     * Get all inquiries
     */
    getInquiries = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildInquiryFilters(req.query);

        const { data, total } = await this.inquiryService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 },
            populate: [
                { path: 'businessUnitId', select: 'name' },
                { path: 'assignedTo', select: 'firstName lastName' },
                { path: 'interestedPrograms', select: 'name category' },
                { path: 'preferredLocations', select: 'name' }
            ]
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Inquiries retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get inquiry by ID
     */
    getInquiryById = asyncHandler(async (req: Request, res: Response) => {
        const inquiry = await this.inquiryService.getById(req.params.id, {
            populate: [
                { path: 'businessUnitId' },
                { path: 'assignedTo', select: 'firstName lastName email phone' },
                { path: 'interestedPrograms' },
                { path: 'preferredLocations' },
                { path: 'convertedToFamilyId', select: 'familyName familyCode' }
            ]
        });

        if (!inquiry) {
            throw new AppError('Inquiry not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, inquiry, 'Inquiry retrieved successfully');
    });

    /**
     * Create inquiry
     */
    createInquiry = asyncHandler(async (req: Request, res: Response) => {
        const inquiry = await this.inquiryService.createInquiry(req.body, req.user.id);

        ResponseUtil.success(res, inquiry, 'Inquiry created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Update inquiry
     */
    updateInquiry = asyncHandler(async (req: Request, res: Response) => {
        const inquiry = await this.inquiryService.update(
            req.params.id,
            { ...req.body, updatedBy: req.user.id }
        );

        ResponseUtil.success(res, inquiry, 'Inquiry updated successfully');
    });

    /**
     * Delete inquiry
     */
    deleteInquiry = asyncHandler(async (req: Request, res: Response) => {
        await this.inquiryService.delete(req.params.id);
        ResponseUtil.success(res, null, 'Inquiry deleted successfully');
    });

    /**
     * Update inquiry status
     */
    updateInquiryStatus = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.body;
        const inquiry = await this.inquiryService.updateInquiryStatus(
            req.params.id,
            status,
            req.user.id
        );

        ResponseUtil.success(res, inquiry, 'Inquiry status updated successfully');
    });

    /**
     * Assign inquiry
     */
    assignInquiry = asyncHandler(async (req: Request, res: Response) => {
        const { assignedTo } = req.body;
        const inquiry = await this.inquiryService.assignInquiry(
            req.params.id,
            assignedTo,
            req.user.id
        );

        ResponseUtil.success(res, inquiry, 'Inquiry assigned successfully');
    });

    /**
     * Convert inquiry to family
     */
    convertInquiry = asyncHandler(async (req: Request, res: Response) => {
        const { familyId } = req.body;
        const inquiry = await this.inquiryService.convertInquiry(
            req.params.id,
            familyId,
            req.user.id
        );

        ResponseUtil.success(res, inquiry, 'Inquiry converted successfully');
    });

    /**
     * Add follow-up note
     */
    addFollowUpNote = asyncHandler(async (req: Request, res: Response) => {
        const { note, nextFollowUp } = req.body;
        const inquiry = await this.inquiryService.addFollowUpNote(
            req.params.id,
            note,
            new Date(nextFollowUp),
            req.user.id
        );

        ResponseUtil.success(res, inquiry, 'Follow-up note added successfully');
    });

    /**
     * Get inquiry statistics
     */
    getInquiryStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;
        const statistics = await this.inquiryService.getInquiryStatistics(
            businessUnitId as string
        );

        ResponseUtil.success(res, statistics, 'Inquiry statistics retrieved successfully');
    });

    private buildInquiryFilters(query: any) {
        const filters: any = {};

        if (query.businessUnitId) filters.businessUnitId = query.businessUnitId;
        if (query.status) filters.status = query.status;
        if (query.source) filters.source = query.source;
        if (query.assignedTo) filters.assignedTo = query.assignedTo;

        if (query.interestedPrograms) {
            filters.interestedPrograms = Array.isArray(query.interestedPrograms)
                ? { $in: query.interestedPrograms }
                : query.interestedPrograms;
        }

        if (query.dateFrom || query.dateTo) {
            filters.createdAt = {};
            if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
            if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
        }

        if (query.searchText) {
            filters.$text = { $search: query.searchText };
        }

        return filters;
    }
}

export class LeadController {
    private leadService: LeadService;

    constructor() {
        this.leadService = new LeadService();
    }

    /**
     * Get all leads
     */
    getLeads = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildLeadFilters(req.query);

        const { data, total } = await this.leadService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { score: -1, createdAt: -1 },
            populate: [
                { path: 'assignedTo', select: 'firstName lastName' },
                { path: 'convertedToInquiryId', select: 'inquiryId status' }
            ]
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);

        ResponseUtil.success(res, data, 'Leads retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get lead by ID
     */
    getLeadById = asyncHandler(async (req: Request, res: Response) => {
        const lead = await this.leadService.getById(req.params.id, {
            populate: [
                { path: 'assignedTo', select: 'firstName lastName email phone' },
                { path: 'convertedToInquiryId' }
            ]
        });

        if (!lead) {
            throw new AppError('Lead not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, lead, 'Lead retrieved successfully');
    });

    /**
     * Create lead
     */
    createLead = asyncHandler(async (req: Request, res: Response) => {
        const lead = await this.leadService.createLead(req.body, req.user.id);

        ResponseUtil.success(res, lead, 'Lead created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Update lead
     */
    updateLead = asyncHandler(async (req: Request, res: Response) => {
        const lead = await this.leadService.update(
            req.params.id,
            { ...req.body, updatedBy: req.user.id }
        );

        ResponseUtil.success(res, lead, 'Lead updated successfully');
    });

    /**
     * Delete lead
     */
    deleteLead = asyncHandler(async (req: Request, res: Response) => {
        await this.leadService.delete(req.params.id);
        ResponseUtil.success(res, null, 'Lead deleted successfully');
    });

    /**
     * Update lead score
     */
    updateLeadScore = asyncHandler(async (req: Request, res: Response) => {
        const lead = await this.leadService.updateLeadScore(
            req.params.id,
            req.body,
            req.user.id
        );

        ResponseUtil.success(res, lead, 'Lead score updated successfully');
    });

    /**
     * Assign lead
     */
    assignLead = asyncHandler(async (req: Request, res: Response) => {
        const { assignedTo } = req.body;
        const lead = await this.leadService.assignLead(
            req.params.id,
            assignedTo,
            req.user.id
        );

        ResponseUtil.success(res, lead, 'Lead assigned successfully');
    });

    private buildLeadFilters(query: any) {
        const filters: any = {};

        if (query.source) filters.source = query.source;
        if (query.status) filters.status = query.status;
        if (query.assignedTo) filters.assignedTo = query.assignedTo;

        if (query.minScore || query.maxScore) {
            filters.score = {};
            if (query.minScore) filters.score.$gte = parseInt(query.minScore);
            if (query.maxScore) filters.score.$lte = parseInt(query.maxScore);
        }

        if (query.dateFrom || query.dateTo) {
            filters.createdAt = {};
            if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
            if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
        }

        return filters;
    }
}