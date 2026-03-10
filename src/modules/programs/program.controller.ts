import { Request, Response, NextFunction } from 'express';
import { ProgramService } from './program.service';
import { BaseController } from '../../shared/base/base.controller';
import { ResponseUtil } from '../../shared/utils/response.util';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constants';
import { AppError } from '../../shared/utils/app-error.util';
import { IProgramFilter, AgeGroupType, SkillLevel } from './program.interface';

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
     */
    public updateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
            }

            const program = await this.programService.updateProgram(id, req.body, userId);

            ResponseUtil.success(res, program, SUCCESS_MESSAGES.UPDATED);
        } catch (error) {
            next(error);
        }
    };

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
     */
    public getProgramStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { businessUnitId } = req.query;

            const statistics = await this.programService.getProgramStatistics(
                businessUnitId as string
            );

            ResponseUtil.success(res, statistics, 'Statistics retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * Duplicate program
     */
    public duplicateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { newName } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
            }

            if (!newName) {
                throw new AppError('New program name is required', HTTP_STATUS.BAD_REQUEST);
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
     */
    public toggleProgramStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
            }

            const program = await this.programService.updateProgram(
                id,
                { isActive },
                userId
            );

            ResponseUtil.success(res, program, `Program ${isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            next(error);
        }
    };
}
