import { Request, Response } from 'express';
import { AthletePassportService, SkillTaxonomyService, PerformanceBenchmarkService } from './athlete-passport.service';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response.util';

export class AthletePassportController extends BaseController {
    private passportService: AthletePassportService;
    private skillService: SkillTaxonomyService;
    private benchmarkService: PerformanceBenchmarkService;

    constructor() {
        super();
        this.passportService = new AthletePassportService();
        this.skillService = new SkillTaxonomyService();
        this.benchmarkService = new PerformanceBenchmarkService();
    }

    /**
     * Create athlete passport
     */
    createPassport = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const passport = await this.passportService.createPassport(req.body, userId);

        return successResponse(res, {
            message: 'Athlete passport created successfully',
            data: passport
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get athlete passport
     */
    getPassport = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;

        const passport = await this.passportService.findOne({ passportId });
        if (!passport) {
            throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Athlete passport retrieved successfully',
            data: passport
        });
    });

    /**
     * Get passport by child ID
     */
    getPassportByChild = asyncHandler(async (req: Request, res: Response) => {
        const { childId } = req.params;

        const passport = await this.passportService.findOne({ childId });
        if (!passport) {
            throw new AppError('Athlete passport not found for this child', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Athlete passport retrieved successfully',
            data: passport
        });
    });

    /**
     * Get passport summary
     */
    getPassportSummary = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;

        const summary = await this.passportService.getPassportSummary(passportId);

        return successResponse(res, {
            message: 'Passport summary retrieved successfully',
            data: summary
        });
    });

    /**
     * Update skill progress
     */
    updateSkillProgress = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const passport = await this.passportService.updateSkillProgress(passportId, req.body, userId);

        return successResponse(res, {
            message: 'Skill progress updated successfully',
            data: passport
        });
    });

    /**
     * Add milestone
     */
    addMilestone = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const passport = await this.passportService.addMilestone(passportId, req.body, userId);

        return successResponse(res, {
            message: 'Milestone added successfully',
            data: passport
        });
    });

    /**
     * Record performance benchmark
     */
    recordBenchmark = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const passport = await this.passportService.recordBenchmark(passportId, req.body, userId);

        return successResponse(res, {
            message: 'Performance benchmark recorded successfully',
            data: passport
        });
    });

    /**
     * Update attendance
     */
    updateAttendance = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;
        const { sessionAttended } = req.body;

        await this.passportService.updateAttendanceStats(passportId, sessionAttended);

        return successResponse(res, {
            message: 'Attendance statistics updated successfully'
        });
    });

    /**
     * Add behavior note
     */
    addBehaviorNote = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;
        const { type, note, category, area } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const passport = await this.passportService.findOne({ passportId });
        if (!passport) {
            throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
        }

        const staffName = await this.getStaffName(userId);

        if (type === 'positive') {
            passport.behaviorProfile.positiveNotes.push({
                date: new Date(),
                note,
                recordedBy: staffName,
                category
            });
        } else if (type === 'improvement') {
            passport.behaviorProfile.areasForImprovement.push({
                date: new Date(),
                area,
                note,
                recordedBy: staffName,
                resolved: false
            });
        } else if (type === 'leadership') {
            passport.behaviorProfile.leadershipMoments.push({
                date: new Date(),
                description: note,
                recognizedBy: staffName
            });
        }

        passport.updatedBy = userId;
        await passport.save();

        return successResponse(res, {
            message: 'Behavior note added successfully',
            data: passport
        });
    });

    /**
     * Request transfer
     */
    requestTransfer = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;

        const passport = await this.passportService.requestTransfer(passportId, req.body);

        return successResponse(res, {
            message: 'Transfer request submitted successfully',
            data: passport
        });
    });

    /**
     * Export passport
     */
    exportPassport = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;

        const exportResult = await this.passportService.exportPassport(passportId, req.body);

        return successResponse(res, {
            message: 'Passport export generated successfully',
            data: exportResult
        });
    });

    /**
     * Generate skill progress report
     */
    generateProgressReport = asyncHandler(async (req: Request, res: Response) => {
        const { passportId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
        }

        const report = await this.passportService.generateSkillProgressReport(
            passportId,
            new Date(startDate as string),
            new Date(endDate as string)
        );

        return successResponse(res, {
            message: 'Skill progress report generated successfully',
            data: report
        });
    });

    /**
     * Get passports with filtering
     */
    getPassports = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            skillLevel,
            program,
            locationId,
            ageMin,
            ageMax,
            search
        } = req.query;

        const filter: any = {};

        if (skillLevel) filter.currentSkillLevel = skillLevel;
        if (program) filter.currentPrograms = { $in: [program] };
        if (locationId) filter.locationIds = { $in: [locationId] };
        if (search) {
            filter.$text = { $search: search };
        }

        // Age filtering would require aggregation pipeline
        let aggregationPipeline: any[] = [];

        if (ageMin || ageMax) {
            const today = new Date();
            aggregationPipeline.push({
                $addFields: {
                    age: {
                        $floor: {
                            $divide: [
                                { $subtract: [today, '$dateOfBirth'] },
                                365.25 * 24 * 60 * 60 * 1000
                            ]
                        }
                    }
                }
            });

            const ageFilter: any = {};
            if (ageMin) ageFilter.$gte = parseInt(ageMin as string);
            if (ageMax) ageFilter.$lte = parseInt(ageMax as string);

            aggregationPipeline.push({
                $match: { age: ageFilter }
            });
        }

        if (Object.keys(filter).length > 0) {
            aggregationPipeline.unshift({ $match: filter });
        }

        let passports;
        if (aggregationPipeline.length > 0) {
            // Add pagination to aggregation
            aggregationPipeline.push(
                { $skip: (Number(page) - 1) * Number(limit) },
                { $limit: Number(limit) }
            );

            passports = await this.passportService.aggregate(aggregationPipeline);
        } else {
            passports = await this.passportService.findWithPagination(
                filter,
                {
                    page: Number(page),
                    limit: Number(limit),
                    sort: { lastActivityDate: -1 }
                }
            );
        }

        return successResponse(res, {
            message: 'Athlete passports retrieved successfully',
            data: passports
        });
    });

    // Skill Taxonomy Management

    /**
     * Create skill definition
     */
    createSkill = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const skill = await this.skillService.createSkill(req.body, userId);

        return successResponse(res, {
            message: 'Skill created successfully',
            data: skill
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get skills
     */
    getSkills = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            category,
            programType,
            ageGroup,
            isActive
        } = req.query;

        const filter: any = {};

        if (category) filter.category = category;
        if (programType) filter.programTypes = { $in: [programType] };
        if (ageGroup) filter.ageGroups = { $in: [ageGroup] };
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const skills = await this.skillService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { category: 1, skillName: 1 }
            }
        );

        return successResponse(res, {
            message: 'Skills retrieved successfully',
            data: skills
        });
    });

    /**
     * Get skill categories
     */
    getSkillCategories = asyncHandler(async (req: Request, res: Response) => {
        const categories = await this.skillService.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        return successResponse(res, {
            message: 'Skill categories retrieved successfully',
            data: categories.map(cat => ({
                category: cat._id,
                skillCount: cat.count
            }))
        });
    });

    // Performance Benchmark Management

    /**
     * Create performance benchmark
     */
    createBenchmark = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const benchmark = await this.benchmarkService.createBenchmark(req.body, userId);

        return successResponse(res, {
            message: 'Performance benchmark created successfully',
            data: benchmark
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get performance benchmarks
     */
    getBenchmarks = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            category,
            measurementType,
            isActive
        } = req.query;

        const filter: any = {};

        if (category) filter.category = category;
        if (measurementType) filter.measurementType = measurementType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const benchmarks = await this.benchmarkService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { category: 1, name: 1 }
            }
        );

        return successResponse(res, {
            message: 'Performance benchmarks retrieved successfully',
            data: benchmarks
        });
    });

    /**
     * Get passport statistics
     */
    getPassportStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId, locationId, programType } = req.query;

        const matchStage: any = {};
        if (businessUnitId) matchStage.businessUnitId = businessUnitId;
        if (locationId) matchStage.locationIds = { $in: [locationId] };
        if (programType) matchStage.currentPrograms = { $in: [programType] };

        const statistics = await this.passportService.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalPassports: { $sum: 1 },
                    averageSkills: { $avg: { $size: '$skillsProgress' } },
                    averageAttendanceRate: { $avg: '$attendanceStats.attendanceRate' },
                    totalMilestones: { $sum: { $size: '$milestones' } },
                    totalCertifications: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$certifications',
                                    cond: { $eq: ['$$this.status', 'earned'] }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        const skillLevelDistribution = await this.passportService.aggregate([
            { $match: matchStage },
            { $group: { _id: '$currentSkillLevel', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        return successResponse(res, {
            message: 'Passport statistics retrieved successfully',
            data: {
                overview: statistics[0] || {
                    totalPassports: 0,
                    averageSkills: 0,
                    averageAttendanceRate: 0,
                    totalMilestones: 0,
                    totalCertifications: 0
                },
                skillLevelDistribution: skillLevelDistribution.map(item => ({
                    skillLevel: item._id,
                    count: item.count
                }))
            }
        });
    });

    // Private helper methods

    private async getStaffName(staffId: string): Promise<string> {
        // Implementation to get staff name
        return `Staff ${staffId}`;
    }
}