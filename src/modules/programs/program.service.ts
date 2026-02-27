import { FilterQuery, Types } from 'mongoose';
import { Program } from './program.model';
import {
    IProgram,
    IProgramFilter,
    IProgramSearchResult,
    IProgramEnrollmentEligibility,
    ProgramType,
    SkillLevel,
    AgeGroupType
} from './program.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class ProgramService extends BaseService<IProgram> {
    constructor() {
        super(Program);
    }

    /**
     * Create a new program
     */
    async createProgram(programData: Partial<IProgram>, createdBy: string): Promise<IProgram> {
        try {
            // Validate business unit and locations exist
            await this.validateBusinessUnitAndLocations(
                programData.businessUnitId!,
                programData.locationIds!
            );

            const program = new Program({
                ...programData,
                createdBy,
                updatedBy: createdBy
            });

            await program.save();
            return await this.getById(program._id.toString());
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create program',
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Update program
     */
    async updateProgram(
        programId: string,
        updateData: Partial<IProgram>,
        updatedBy: string
    ): Promise<IProgram> {
        try {
            const program = await this.getById(programId);
            if (!program) {
                throw new AppError('Program not found', HTTP_STATUS.NOT_FOUND);
            }

            // Validate business unit and locations if being updated
            if (updateData.businessUnitId || updateData.locationIds) {
                await this.validateBusinessUnitAndLocations(
                    updateData.businessUnitId || program.businessUnitId,
                    updateData.locationIds || program.locationIds
                );
            }

            Object.assign(program, updateData, { updatedBy });
            await program.save();

            return await this.getById(programId);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update program',
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Search programs with advanced filtering
     */
    async searchPrograms(
        filter: IProgramFilter,
        page: number = 1,
        limit: number = 20,
        sortBy: string = 'name',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<IProgramSearchResult> {
        try {
            const query = this.buildSearchQuery(filter);

            // Get programs
            const programs = await this.findWithPagination(
                query,
                page,
                limit,
                { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
            );

            // Get total count
            const totalCount = await Program.countDocuments(query);

            // Get filter options for frontend
            const filterOptions = await this.getFilterOptions(filter);

            return {
                programs: programs.data,
                totalCount,
                filters: filterOptions
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to search programs',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get programs by category
     */
    async getProgramsByCategory(
        category: string,
        businessUnitId?: string,
        locationId?: string
    ): Promise<IProgram[]> {
        try {
            const query: FilterQuery<IProgram> = {
                category,
                isActive: true,
                isPublic: true
            };

            if (businessUnitId) {
                query.businessUnitId = new Types.ObjectId(businessUnitId);
            }

            if (locationId) {
                query.locationIds = { $in: [new Types.ObjectId(locationId)] };
            }

            return await Program.find(query)
                .populate('businessUnitId', 'name type')
                .populate('locationIds', 'name address')
                .sort({ name: 1 })
                .exec();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get programs by category',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get programs suitable for age group
     */
    async getProgramsForAgeGroup(
        age: number,
        ageType: AgeGroupType,
        businessUnitId?: string,
        locationId?: string
    ): Promise<IProgram[]> {
        try {
            const query: FilterQuery<IProgram> = {
                isActive: true,
                isPublic: true,
                $or: [
                    {
                        'ageGroups': {
                            $elemMatch: {
                                minAge: { $lte: age },
                                maxAge: { $gte: age },
                                ageType: ageType
                            }
                        }
                    }
                ]
            };

            if (businessUnitId) {
                query.businessUnitId = new Types.ObjectId(businessUnitId);
            }

            if (locationId) {
                query.locationIds = { $in: [new Types.ObjectId(locationId)] };
            }

            return await Program.find(query)
                .populate('businessUnitId', 'name type')
                .populate('locationIds', 'name address')
                .sort({ category: 1, name: 1 })
                .exec();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get programs for age group',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Check enrollment eligibility
     */
    async checkEnrollmentEligibility(
        programId: string,
        childAge: number,
        childAgeType: AgeGroupType,
        skillLevel?: SkillLevel,
        prerequisitePrograms?: string[]
    ): Promise<IProgramEnrollmentEligibility> {
        try {
            const program = await this.getById(programId);
            if (!program) {
                throw new AppError('Program not found', HTTP_STATUS.NOT_FOUND);
            }

            const eligibility = program.checkEligibility(childAge, childAgeType, skillLevel);

            if (!eligibility.eligible) {
                // Find alternative programs
                const alternatives = await this.findAlternativePrograms(
                    program,
                    childAge,
                    childAgeType,
                    skillLevel
                );

                return {
                    eligible: false,
                    reasons: eligibility.reasons,
                    alternatives
                };
            }

            // Check prerequisites if required
            if (program.eligibilityRules.prerequisitePrograms?.length > 0) {
                const hasPrerequisites = prerequisitePrograms?.some(prereq =>
                    program.eligibilityRules.prerequisitePrograms!.includes(prereq)
                );

                if (!hasPrerequisites) {
                    return {
                        eligible: false,
                        reasons: ['Missing prerequisite programs'],
                        requirements: program.eligibilityRules.prerequisitePrograms.map(id => id.toString())
                    };
                }
            }

            return { eligible: true };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to check enrollment eligibility',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get program pricing with discounts
     */
    async getProgramPricing(
        programId: string,
        discountType?: string,
        siblingCount?: number
    ): Promise<{
        basePrice: number;
        discountedPrice: number;
        discountAmount: number;
        additionalFees: Record<string, number>;
        totalPrice: number;
    }> {
        try {
            const program = await this.getById(programId);
            if (!program) {
                throw new AppError('Program not found', HTTP_STATUS.NOT_FOUND);
            }

            const basePrice = program.pricingModel.basePrice;
            let discountedPrice = basePrice;
            let discountAmount = 0;

            // Apply discount
            if (discountType && program.pricingModel.discounts) {
                const discount = program.pricingModel.discounts[discountType as keyof typeof program.pricingModel.discounts];
                if (discount) {
                    discountAmount = (basePrice * discount) / 100;
                    discountedPrice = basePrice - discountAmount;
                }
            }

            // Apply sibling discount if applicable
            if (siblingCount && siblingCount > 0 && program.pricingModel.discounts?.sibling) {
                const siblingDiscount = (discountedPrice * program.pricingModel.discounts.sibling) / 100;
                discountAmount += siblingDiscount;
                discountedPrice -= siblingDiscount;
            }

            const additionalFees = program.pricingModel.additionalFees || {};
            const totalFees = Object.values(additionalFees).reduce((sum, fee) => sum + (fee || 0), 0);
            const totalPrice = discountedPrice + totalFees;

            return {
                basePrice,
                discountedPrice,
                discountAmount,
                additionalFees,
                totalPrice: Math.round(totalPrice * 100) / 100
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get program pricing',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get program statistics
     */
    async getProgramStatistics(businessUnitId?: string): Promise<{
        totalPrograms: number;
        activePrograms: number;
        programsByType: Record<ProgramType, number>;
        programsByCategory: Record<string, number>;
        averagePrice: number;
        totalEnrollments: number;
    }> {
        try {
            const matchStage: any = {};
            if (businessUnitId) {
                matchStage.businessUnitId = new Types.ObjectId(businessUnitId);
            }

            const stats = await Program.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalPrograms: { $sum: 1 },
                        activePrograms: {
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                        },
                        averagePrice: { $avg: '$pricingModel.basePrice' },
                        totalEnrollments: { $sum: '$enrollmentCount' },
                        programTypes: { $push: '$programType' },
                        categories: { $push: '$category' }
                    }
                }
            ]);

            if (!stats.length) {
                return {
                    totalPrograms: 0,
                    activePrograms: 0,
                    programsByType: {} as Record<ProgramType, number>,
                    programsByCategory: {},
                    averagePrice: 0,
                    totalEnrollments: 0
                };
            }

            const stat = stats[0];

            // Count by type
            const programsByType = stat.programTypes.reduce((acc: Record<ProgramType, number>, type: ProgramType) => {
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {} as Record<ProgramType, number>);

            // Count by category
            const programsByCategory = stat.categories.reduce((acc: Record<string, number>, category: string) => {
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});

            return {
                totalPrograms: stat.totalPrograms,
                activePrograms: stat.activePrograms,
                programsByType,
                programsByCategory,
                averagePrice: Math.round(stat.averagePrice * 100) / 100,
                totalEnrollments: stat.totalEnrollments
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get program statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Duplicate program
     */
    async duplicateProgram(
        programId: string,
        newName: string,
        createdBy: string
    ): Promise<IProgram> {
        try {
            const originalProgram = await this.getById(programId);
            if (!originalProgram) {
                throw new AppError('Program not found', HTTP_STATUS.NOT_FOUND);
            }

            const programData = originalProgram.toObject();
            delete programData._id;
            delete programData.createdAt;
            delete programData.updatedAt;
            delete programData.__v;

            const duplicatedProgram = new Program({
                ...programData,
                name: newName,
                enrollmentCount: 0,
                version: 1,
                createdBy,
                updatedBy: createdBy
            });

            await duplicatedProgram.save();
            return await this.getById(duplicatedProgram._id.toString());
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to duplicate program',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private buildSearchQuery(filter: IProgramFilter): FilterQuery<IProgram> {
        const query: FilterQuery<IProgram> = {};

        if (filter.programType) {
            query.programType = filter.programType;
        }

        if (filter.category) {
            query.category = filter.category;
        }

        if (filter.subcategory) {
            query.subcategory = filter.subcategory;
        }

        if (filter.skillLevel) {
            query.skillLevels = { $in: [filter.skillLevel] };
        }

        if (filter.ageGroup) {
            query.ageGroups = {
                $elemMatch: {
                    minAge: { $lte: filter.ageGroup.maxAge },
                    maxAge: { $gte: filter.ageGroup.minAge },
                    ageType: filter.ageGroup.ageType
                }
            };
        }

        if (filter.locationId) {
            query.locationIds = { $in: [new Types.ObjectId(filter.locationId)] };
        }

        if (filter.businessUnitId) {
            query.businessUnitId = new Types.ObjectId(filter.businessUnitId);
        }

        if (filter.isActive !== undefined) {
            query.isActive = filter.isActive;
        }

        if (filter.isPublic !== undefined) {
            query.isPublic = filter.isPublic;
        }

        if (filter.priceRange) {
            query['pricingModel.basePrice'] = {
                $gte: filter.priceRange.min,
                $lte: filter.priceRange.max
            };
        }

        if (filter.availableDay) {
            query.availableDays = { $in: [filter.availableDay] };
        }

        if (filter.tags && filter.tags.length > 0) {
            query.tags = { $in: filter.tags };
        }

        return query;
    }

    private async getFilterOptions(filter: IProgramFilter): Promise<any> {
        const matchStage: any = {};
        if (filter.businessUnitId) {
            matchStage.businessUnitId = new Types.ObjectId(filter.businessUnitId);
        }

        const aggregation = await Program.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    categories: { $addToSet: '$category' },
                    skillLevels: { $addToSet: { $arrayElemAt: ['$skillLevels', 0] } },
                    minPrice: { $min: '$pricingModel.basePrice' },
                    maxPrice: { $max: '$pricingModel.basePrice' },
                    ageGroups: { $addToSet: { $arrayElemAt: ['$ageGroups', 0] } }
                }
            }
        ]);

        if (!aggregation.length) {
            return {
                categories: [],
                skillLevels: [],
                ageGroups: [],
                priceRange: { min: 0, max: 0 },
                locations: []
            };
        }

        const result = aggregation[0];

        return {
            categories: result.categories || [],
            skillLevels: result.skillLevels || [],
            ageGroups: result.ageGroups || [],
            priceRange: {
                min: result.minPrice || 0,
                max: result.maxPrice || 0
            },
            locations: [] // Would be populated from location service
        };
    }

    private async findAlternativePrograms(
        program: IProgram,
        childAge: number,
        childAgeType: AgeGroupType,
        skillLevel?: SkillLevel
    ): Promise<Array<{ programId: string; programName: string; reason: string }>> {
        try {
            // Find programs in same category but different age groups or skill levels
            const alternatives = await Program.find({
                category: program.category,
                _id: { $ne: program._id },
                isActive: true,
                isPublic: true,
                businessUnitId: program.businessUnitId
            }).limit(3);

            return alternatives.map(alt => ({
                programId: alt._id.toString(),
                programName: alt.name,
                reason: 'Similar program with different requirements'
            }));
        } catch (error) {
            return [];
        }
    }

    private async validateBusinessUnitAndLocations(
        businessUnitId: string,
        locationIds: string[]
    ): Promise<void> {
        // This would validate against BusinessUnit and Location models
        // For now, we'll assume they exist
        if (!businessUnitId || !locationIds || locationIds.length === 0) {
            throw new AppError('Business unit and locations are required', HTTP_STATUS.BAD_REQUEST);
        }
    }
}