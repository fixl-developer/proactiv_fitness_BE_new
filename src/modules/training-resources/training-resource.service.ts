import { FilterQuery, Types } from 'mongoose';
import {
    TrainingResource,
    TrainingResourceView,
    ITrainingResource,
    ResourceCategory,
    ResourceType,
} from './training-resource.model';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export interface ListFilters {
    search?: string;
    category?: ResourceCategory;
    type?: ResourceType;
    featured?: boolean;
    includeInactive?: boolean;
    page?: number;
    limit?: number;
}

export interface CreateResourceInput {
    title: string;
    description: string;
    url: string;
    type?: ResourceType;
    category?: ResourceCategory;
    tags?: string[];
    estimatedMinutes?: number;
    featured?: boolean;
}

export class TrainingResourceService {
    async list(filters: ListFilters) {
        const {
            search = '',
            category,
            type,
            featured,
            includeInactive = false,
            page = 1,
            limit = 50,
        } = filters;

        const query: FilterQuery<ITrainingResource> = {};
        if (!includeInactive) query.isActive = true;
        if (category) query.category = category;
        if (type) query.type = type;
        if (typeof featured === 'boolean') query.featured = featured;

        if (search.trim()) {
            const term = search.trim();
            query.$or = [
                { title: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { tags: { $regex: term, $options: 'i' } },
            ];
        }

        const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

        const [items, total] = await Promise.all([
            TrainingResource.find(query)
                .sort({ featured: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            TrainingResource.countDocuments(query),
        ]);

        return {
            resources: items,
            total,
            page,
            limit,
            pages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async getById(id: string): Promise<ITrainingResource> {
        if (!Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid resource id', HTTP_STATUS.BAD_REQUEST);
        }
        const doc = await TrainingResource.findById(id);
        if (!doc) throw new AppError('Resource not found', HTTP_STATUS.NOT_FOUND);
        return doc;
    }

    async create(input: CreateResourceInput, userId: string, userName: string) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user id', HTTP_STATUS.BAD_REQUEST);
        }
        const doc = await TrainingResource.create({
            ...input,
            addedBy: new Types.ObjectId(userId),
            addedByName: userName,
            tags: input.tags || [],
            estimatedMinutes: input.estimatedMinutes ?? 0,
            featured: input.featured ?? false,
            type: input.type || 'link',
            category: input.category || 'other',
        });
        return doc.toObject();
    }

    async update(id: string, input: Partial<CreateResourceInput>) {
        const doc = await this.getById(id);
        const allowed: (keyof CreateResourceInput)[] = [
            'title',
            'description',
            'url',
            'type',
            'category',
            'tags',
            'estimatedMinutes',
            'featured',
        ];
        for (const key of allowed) {
            if (input[key] !== undefined) (doc as any)[key] = input[key];
        }
        await doc.save();
        return doc.toObject();
    }

    async delete(id: string) {
        const doc = await this.getById(id);
        // Soft delete — keep history
        doc.isActive = false;
        await doc.save();
        return { id, deleted: true };
    }

    async hardDelete(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid resource id', HTTP_STATUS.BAD_REQUEST);
        }
        const result = await TrainingResource.findByIdAndDelete(id);
        if (!result) throw new AppError('Resource not found', HTTP_STATUS.NOT_FOUND);
        await TrainingResourceView.deleteMany({ resourceId: result._id });
        return { id, deleted: true };
    }

    async recordView(resourceId: string, userId: string) {
        const doc = await this.getById(resourceId);
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user id', HTTP_STATUS.BAD_REQUEST);
        }
        const now = new Date();
        await TrainingResourceView.create({
            resourceId: doc._id,
            userId: new Types.ObjectId(userId),
            openedAt: now,
        });
        doc.viewCount = (doc.viewCount || 0) + 1;
        doc.lastOpenedAt = now;
        await doc.save();
        return { resourceId, openedAt: now, viewCount: doc.viewCount };
    }

    async getUserStats(userId: string) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user id', HTTP_STATUS.BAD_REQUEST);
        }
        const userObjId = new Types.ObjectId(userId);

        const [totalResources, viewedAgg, recentViews, totalMinutesAgg, streak] = await Promise.all([
            TrainingResource.countDocuments({ isActive: true }),
            TrainingResourceView.aggregate([
                { $match: { userId: userObjId } },
                { $group: { _id: '$resourceId' } },
                { $count: 'unique' },
            ]),
            TrainingResourceView.find({ userId: userObjId })
                .sort({ openedAt: -1 })
                .limit(5)
                .populate('resourceId', 'title category type estimatedMinutes')
                .lean(),
            TrainingResourceView.aggregate([
                { $match: { userId: userObjId } },
                {
                    $lookup: {
                        from: 'trainingresources',
                        localField: 'resourceId',
                        foreignField: '_id',
                        as: 'resource',
                    },
                },
                { $unwind: { path: '$resource', preserveNullAndEmptyArrays: true } },
                { $group: { _id: '$resourceId', minutes: { $first: '$resource.estimatedMinutes' } } },
                { $group: { _id: null, total: { $sum: '$minutes' } } },
            ]),
            this.computeStreak(userObjId),
        ]);

        const uniqueViewed = viewedAgg[0]?.unique || 0;
        const totalMinutes = totalMinutesAgg[0]?.total || 0;

        return {
            totalResources,
            viewedResources: uniqueViewed,
            totalMinutes,
            totalHours: Math.round((totalMinutes / 60) * 10) / 10,
            currentStreak: streak,
            recentViews: recentViews.map((v: any) => ({
                openedAt: v.openedAt,
                resource: v.resourceId
                    ? {
                          id: String(v.resourceId._id || v.resourceId),
                          title: v.resourceId.title || '',
                          category: v.resourceId.category || '',
                          type: v.resourceId.type || '',
                          estimatedMinutes: v.resourceId.estimatedMinutes || 0,
                      }
                    : null,
            })),
        };
    }

    private async computeStreak(userId: Types.ObjectId): Promise<number> {
        // Count consecutive days (counting back from today) with at least one view
        const views = await TrainingResourceView.find({ userId })
            .sort({ openedAt: -1 })
            .select('openedAt')
            .limit(365)
            .lean();
        if (!views.length) return 0;

        const dayKey = (d: Date) => {
            const dt = new Date(d);
            return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        };
        const days = new Set(views.map((v) => dayKey(v.openedAt as Date)));

        let streak = 0;
        const cursor = new Date();
        // Allow today not yet have a view; start from yesterday if today missing
        let allowSkipToday = true;
        while (true) {
            const key = dayKey(cursor);
            if (days.has(key)) {
                streak += 1;
                allowSkipToday = false;
            } else if (allowSkipToday) {
                allowSkipToday = false;
            } else {
                break;
            }
            cursor.setDate(cursor.getDate() - 1);
            if (streak > 365) break;
        }
        return streak;
    }
}
