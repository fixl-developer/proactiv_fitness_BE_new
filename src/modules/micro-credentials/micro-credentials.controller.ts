import { Request, Response } from 'express';
import { MicroCredentialService, BadgeService } from './micro-credentials.service';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response.util';

export class MicroCredentialController extends BaseController {
    private credentialService: MicroCredentialService;
    private badgeService: BadgeService;

    constructor() {
        super();
        this.credentialService = new MicroCredentialService();
        this.badgeService = new BadgeService();
    }

    // Credential Management

    createCredential = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const credential = await this.credentialService.createCredential(req.body, userId);

        return successResponse(res, {
            message: 'Micro-credential created successfully',
            data: credential
        }, HTTP_STATUS.CREATED);
    });

    getCredentials = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            category,
            level,
            badgeType,
            isActive
        } = req.query;

        const filter: any = {};
        if (category) filter.category = category;
        if (level) filter.level = level;
        if (badgeType) filter.badgeType = badgeType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const credentials = await this.credentialService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { createdAt: -1 }
            }
        );

        return successResponse(res, {
            message: 'Credentials retrieved successfully',
            data: credentials
        });
    });

    getCredential = asyncHandler(async (req: Request, res: Response) => {
        const { credentialId } = req.params;

        const credential = await this.credentialService.findOne({ credentialId });
        if (!credential) {
            throw new AppError('Credential not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Credential retrieved successfully',
            data: credential
        });
    });

    issueCredential = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const issuedCredential = await this.credentialService.issueCredential(req.body, userId);

        return successResponse(res, {
            message: 'Credential issued successfully',
            data: issuedCredential
        }, HTTP_STATUS.CREATED);
    });

    verifyCredential = asyncHandler(async (req: Request, res: Response) => {
        const verificationResult = await this.credentialService.verifyCredential(req.body);

        return successResponse(res, {
            message: verificationResult.isValid ? 'Credential verified successfully' : 'Credential verification failed',
            data: verificationResult
        });
    });

    getIssuedCredentials = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            recipientId,
            credentialId,
            status,
            isExpired
        } = req.query;

        const filter: any = {};
        if (recipientId) filter.recipientId = recipientId;
        if (credentialId) filter.credentialId = credentialId;
        if (status) filter.status = status;
        if (isExpired !== undefined) filter.isExpired = isExpired === 'true';

        const issuedCredentials = await this.credentialService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { issuedDate: -1 }
            }
        );

        return successResponse(res, {
            message: 'Issued credentials retrieved successfully',
            data: issuedCredentials
        });
    });

    getCredentialPortfolio = asyncHandler(async (req: Request, res: Response) => {
        const { recipientId } = req.params;

        const portfolio = await this.credentialService.getCredentialPortfolio(recipientId);

        return successResponse(res, {
            message: 'Credential portfolio retrieved successfully',
            data: portfolio
        });
    });

    // Badge Management

    createBadge = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const badge = await this.badgeService.createBadge(req.body, userId);

        return successResponse(res, {
            message: 'Badge created successfully',
            data: badge
        }, HTTP_STATUS.CREATED);
    });

    getBadges = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            category,
            badgeType,
            rarity,
            difficulty,
            isActive
        } = req.query;

        const filter: any = {};
        if (category) filter.category = category;
        if (badgeType) filter.badgeType = badgeType;
        if (rarity) filter.rarity = rarity;
        if (difficulty) filter.difficulty = difficulty;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const badges = await this.badgeService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { pointValue: -1 }
            }
        );

        return successResponse(res, {
            message: 'Badges retrieved successfully',
            data: badges
        });
    });

    awardBadge = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const earnedBadge = await this.badgeService.awardBadge(req.body, userId);

        return successResponse(res, {
            message: 'Badge awarded successfully',
            data: earnedBadge
        }, HTTP_STATUS.CREATED);
    });

    getBadgeCollection = asyncHandler(async (req: Request, res: Response) => {
        const { recipientId } = req.params;

        const collection = await this.badgeService.getBadgeCollection(recipientId);

        return successResponse(res, {
            message: 'Badge collection retrieved successfully',
            data: collection
        });
    });

    getEarnedBadges = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            recipientId,
            badgeId,
            isPinned
        } = req.query;

        const filter: any = {};
        if (recipientId) filter.recipientId = recipientId;
        if (badgeId) filter.badgeId = badgeId;
        if (isPinned !== undefined) filter['displaySettings.isPinned'] = isPinned === 'true';

        const earnedBadges = await this.badgeService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { earnedDate: -1 }
            }
        );

        return successResponse(res, {
            message: 'Earned badges retrieved successfully',
            data: earnedBadges
        });
    });

    updateBadgeDisplay = asyncHandler(async (req: Request, res: Response) => {
        const { earnedBadgeId } = req.params;
        const { isPinned, displayOrder, showOnProfile } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const earnedBadge = await this.badgeService.findOne({ earnedBadgeId } as any) as any;
        if (!earnedBadge) {
            throw new AppError('Earned badge not found', HTTP_STATUS.NOT_FOUND);
        }

        earnedBadge.displaySettings = earnedBadge.displaySettings || {};
        if (isPinned !== undefined) earnedBadge.displaySettings.isPinned = isPinned;
        if (displayOrder !== undefined) earnedBadge.displaySettings.displayOrder = displayOrder;
        if (showOnProfile !== undefined) earnedBadge.displaySettings.showOnProfile = showOnProfile;

        earnedBadge.updatedBy = userId;
        await earnedBadge.save();

        return successResponse(res, {
            message: 'Badge display settings updated successfully',
            data: earnedBadge
        });
    });

    getCredentialStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;

        const matchStage: any = {};
        if (businessUnitId) matchStage.businessUnitId = businessUnitId;

        const credentialStats = await this.credentialService.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalCredentials: { $sum: 1 },
                    activeCredentials: { $sum: { $cond: ['$isActive', 1, 0] } },
                    totalIssued: { $sum: '$statistics.totalIssued' },
                    totalActive: { $sum: '$statistics.totalActive' },
                    averageSuccessRate: { $avg: '$statistics.successRate' }
                }
            }
        ]);

        const levelDistribution = await this.credentialService.aggregate([
            { $match: matchStage },
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        return successResponse(res, {
            message: 'Credential statistics retrieved successfully',
            data: {
                overview: credentialStats[0] || {},
                levelDistribution: levelDistribution.map(item => ({
                    level: item._id,
                    count: item.count
                }))
            }
        });
    });

    getBadgeStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;

        const matchStage: any = {};
        if (businessUnitId) matchStage.businessUnitId = businessUnitId;

        const badgeStats = await this.badgeService.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalBadges: { $sum: 1 },
                    activeBadges: { $sum: { $cond: ['$isActive', 1, 0] } },
                    totalPoints: { $sum: '$pointValue' }
                }
            }
        ]);

        const rarityDistribution = await this.badgeService.aggregate([
            { $match: matchStage },
            { $group: { _id: '$rarity', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        return successResponse(res, {
            message: 'Badge statistics retrieved successfully',
            data: {
                overview: badgeStats[0] || {},
                rarityDistribution: rarityDistribution.map(item => ({
                    rarity: item._id,
                    count: item.count
                }))
            }
        });
    });
}