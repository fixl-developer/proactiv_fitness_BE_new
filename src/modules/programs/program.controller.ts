import { Request, Response, NextFunction } from 'express';
import { ProgramService } from './program.service';
import { BaseController } from '../../shared/base/base.controller';
import { ResponseUtil } from '../../shared/utils/response.util';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constants';
import { AppError } from '../../shared/utils/app-error.util';
import { IProgramFilter, AgeGroupType, SkillLevel } from './program.interface';
import { Program } from './program.model';

export class ProgramController extends BaseController {
    private programService: ProgramService;

    constructor() {
        super();
        this.programService = new ProgramService();
    }

    /**
     * Create a new program
     */
    public createProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
            }

            const program = await this.programService.createProgram(req.body, userId);

            ResponseUtil.created(res, program, SUCCESS_MESSAGES.CREATED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all programs with filtering and pagination
     */
    public getPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'name',
                sortOrder = 'asc',
                programType,
                category,
                subcategory,
                skillLevel,
                locationId,
                businessUnitId,
                isActive,
                isPublic,
                availableDay,
                tags,
                minAge,
                maxAge,
                ageType,
                minPrice,
                maxPrice
            } = req.query;

            const filter: IProgramFilter = {};

            if (programType) filter.programType = programType as any;
            if (category) filter.category = category as string;
            if (subcategory) filter.subcategory = subcategory as string;
            if (skillLevel) filter.skillLevel = skillLevel as SkillLevel;
            if (locationId) filter.locationId = locationId as string;
            if (businessUnitId) filter.businessUnitId = businessUnitId as string;
            if (isActive !== undefined) filter.isActive = isActive === 'true';
            if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
            if (availableDay) filter.availableDay = availableDay as string;
            if (tags) filter.tags = Array.isArray(tags) ? tags as string[] : [tags as string];

            if (minAge && maxAge && ageType) {
                filter.ageGroup = {
                    minAge: parseInt(minAge as string),
                    maxAge: parseInt(maxAge as string),
                    ageType: ageType as AgeGroupType
                };
            }

            if (minPrice && maxPrice) {
                filter.priceRange = {
                    min: parseFloat(minPrice as string),
                    max: parseFloat(maxPrice as string)
                };
            }

            const result = await this.programService.searchPrograms(
                filter,
                parseInt(page as string),
                parseInt(limit as string),
                sortBy as string,
                sortOrder as 'asc' | 'desc'
            );

            ResponseUtil.success(res, result, SUCCESS_MESSAGES.RETRIEVED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get program by ID
     */
    public getProgramById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const program = await this.programService.findById(id);

            if (!program) {
                throw new AppError('Program not found', HTTP_STATUS.NOT_FOUND);
            }

            ResponseUtil.success(res, program, SUCCESS_MESSAGES.RETRIEVED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update program
     *
     * Adapter: admin Programs UI uses a flat shape (type, level, ageGroup, capacity,
     * price, status). Map those onto the rich nested fields the service/model expect.
     */
    public updateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
            }

            const updates = this.adaptSimpleProgramFields(req.body);
            const program = await this.programService.updateProgram(id, updates, userId);

            ResponseUtil.success(res, program, SUCCESS_MESSAGES.UPDATED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Translate the simplified Programs UI payload into the nested model shape.
     * Pass-through any keys that are already in the rich form.
     */
    private adaptSimpleProgramFields(body: any): any {
        const out: any = { ...body };

        if (body.type && !body.programType) {
            const map: Record<string, string> = {
                gymnastics: 'regular',
                ninja: 'regular',
                tumbling: 'regular',
                regular: 'regular',
                camp: 'camp',
                event: 'event',
                party: 'party',
                assessment: 'assessment',
                private: 'private'
            };
            out.programType = map[String(body.type).toLowerCase()] || 'regular';
            if (!body.category) out.category = body.type;
            delete out.type;
        }

        if (body.level && !body.skillLevels) {
            out.skillLevels = [String(body.level).toLowerCase()];
            delete out.level;
        }

        if (body.ageGroup && !body.ageGroups) {
            const [minStr, maxStr] = String(body.ageGroup).split('-');
            const minAge = Number(minStr) || 5;
            const maxAge = Number(maxStr) || 12;
            out.ageGroups = [{
                minAge,
                maxAge,
                ageType: 'years',
                description: `Ages ${minAge}-${maxAge}`
            }];
            delete out.ageGroup;
        }

        if (typeof body.capacity === 'number' && !body.capacityRules) {
            out.capacityRules = {
                minParticipants: 1,
                maxParticipants: body.capacity,
                coachToParticipantRatio: 10,
                waitlistCapacity: 5,
                allowOverbooking: false
            };
            delete out.capacity;
        }

        if (typeof body.price === 'number' && !body.pricingModel) {
            out.pricingModel = {
                basePrice: body.price,
                currency: 'USD',
                pricingType: 'per_term'
            };
            delete out.price;
        }

        if (body.status && typeof body.isActive === 'undefined') {
            const s = String(body.status).toLowerCase();
            out.isActive = s === 'active';
            if (s === 'draft') out.isPublic = false;
            delete out.status;
        }

        return out;
    }

    /**
     * Delete program (soft delete)
     */
    public deleteProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.programService.delete(id);

            ResponseUtil.success(res, null, SUCCESS_MESSAGES.DELETED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get programs by category
     */
    public getProgramsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { category } = req.params;
            const { businessUnitId, locationId } = req.query;

            const programs = await this.programService.getProgramsByCategory(
                category,
                businessUnitId as string,
                locationId as string
            );

            ResponseUtil.success(res, programs, SUCCESS_MESSAGES.RETRIEVED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get programs for specific age group
     */
    public getProgramsForAge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { age, ageType } = req.params;
            const { businessUnitId, locationId } = req.query;

            const programs = await this.programService.getProgramsForAgeGroup(
                parseInt(age),
                ageType as AgeGroupType,
                businessUnitId as string,
                locationId as string
            );

            ResponseUtil.success(res, programs, SUCCESS_MESSAGES.RETRIEVED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Check enrollment eligibility
     */
    public checkEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { childAge, childAgeType, skillLevel, prerequisitePrograms } = req.body;

            const eligibility = await this.programService.checkEnrollmentEligibility(
                id,
                childAge,
                childAgeType,
                skillLevel,
                prerequisitePrograms
            );

            ResponseUtil.success(res, eligibility, 'Eligibility check completed');
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get program pricing
     */
    public getProgramPricing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { discountType, siblingCount } = req.query;

            const pricing = await this.programService.getProgramPricing(
                id,
                discountType as string,
                siblingCount ? parseInt(siblingCount as string) : undefined
            );

            ResponseUtil.success(res, pricing, 'Pricing calculated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get program statistics
     *
     * Returns both the rich service shape AND legacy aliases the admin
     * Programs Catalog UI expects ({ totalPrograms, activePrograms, totalEnrolled, averageCapacity }).
     */
    public getProgramStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { businessUnitId } = req.query;

            const statistics: any = await this.programService.getProgramStatistics(
                businessUnitId as string
            );

            // Compute averageCapacity from the raw aggregation
            let averageCapacity = 0;
            try {
                const agg = await Program.aggregate([
                    ...(businessUnitId ? [{ $match: { businessUnitId } }] : []),
                    { $group: { _id: null, avgCap: { $avg: '$capacityRules.maxParticipants' } } }
                ]);
                averageCapacity = Math.round(agg?.[0]?.avgCap || 0);
            } catch {
                averageCapacity = 0;
            }

            const payload = {
                ...statistics,
                // UI aliases
                totalEnrolled: statistics.totalEnrollments ?? 0,
                averageCapacity
            };

            ResponseUtil.success(res, payload, 'Statistics retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * Duplicate program
     *
     * Admin UI sends an empty body — derive a default newName ("<Original> (Copy)")
     * if the client doesn't supply one.
     */
    public duplicateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            let { newName } = req.body || {};
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
            }

            if (!newName) {
                const original = await this.programService.findById(id);
                if (!original) {
                    throw new AppError('Program not found', HTTP_STATUS.NOT_FOUND);
                }
                newName = `${original.name} (Copy)`;
            }

            const duplicatedProgram = await this.programService.duplicateProgram(
                id,
                newName,
                userId
            );

            ResponseUtil.created(res, duplicatedProgram, 'Program duplicated successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * Search programs with text search
     */
    public searchPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { q, page = 1, limit = 20 } = req.query;

            if (!q) {
                throw new AppError('Search query is required', HTTP_STATUS.BAD_REQUEST);
            }

            const programs = await this.programService.findWithPagination(
                { $text: { $search: q as string } } as any,
                { page: parseInt(page as string), limit: parseInt(limit as string) }
            );

            ResponseUtil.success(res, programs, SUCCESS_MESSAGES.RETRIEVED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get program categories
     */
    public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { businessUnitId } = req.query;

            const categories = await this.programService.getCategories(businessUnitId as string);

            ResponseUtil.success(res, categories, SUCCESS_MESSAGES.RETRIEVED);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Activate/Deactivate program
     *
     * Accepts either { isActive: boolean } (legacy) or { status: 'active'|'inactive'|'draft' }
     * (admin Programs UI). Maps status → isActive/isPublic before delegating to service.
     */
    public toggleProgramStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { isActive: rawIsActive, status } = req.body || {};
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
            }

            const updates: any = {};
            if (typeof rawIsActive === 'boolean') {
                updates.isActive = rawIsActive;
            } else if (typeof status === 'string') {
                const s = status.toLowerCase();
                updates.isActive = s === 'active';
                if (s === 'draft') {
                    updates.isPublic = false;
                }
            } else {
                throw new AppError('Either status or isActive is required', HTTP_STATUS.BAD_REQUEST);
            }

            const program = await this.programService.updateProgram(id, updates, userId);

            ResponseUtil.success(res, program, `Program status updated successfully`);
        } catch (error) {
            next(error);
        }
    };
}
