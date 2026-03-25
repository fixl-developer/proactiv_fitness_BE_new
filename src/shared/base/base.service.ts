import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IPaginationQuery, IPaginationResult } from '@shared/interfaces/common.interface';
import { PaginationUtil } from '@shared/utils/pagination.util';

// Lazy import to avoid circular dependencies
let _emitEntityEvent: any = null;
function getEmitter() {
    if (!_emitEntityEvent) {
        try {
            const mod = require('../../modules/realtime/realtime.emitter');
            _emitEntityEvent = mod.emitEntityEvent;
        } catch {
            _emitEntityEvent = () => {}; // Noop if module not loaded yet
        }
    }
    return _emitEntityEvent;
}

// Re-export EntityContext type for service overrides
export interface EntityContext {
    tenantId?: string;
    organizationId?: string;
    locationId?: string;
    userId?: string;
    targetUserId?: string;
    additionalRooms?: string[];
}

export abstract class BaseService<T extends Document> {
    constructor(
        protected model: Model<T>,
        protected entityName?: string // e.g., 'booking', 'program' — opt-in to realtime events
    ) { }

    /**
     * Override in subclasses to provide context for realtime event routing.
     * Return null to skip realtime emission for a specific document.
     */
    protected getEntityContext(doc: T): EntityContext | null {
        return null;
    }

    /**
     * Emit a realtime event. Can be called from custom service methods too.
     */
    protected emitRealtimeEvent(action: string, doc: any): void {
        if (!this.entityName) return;
        try {
            const context = this.getEntityContext(doc);
            const emitter = getEmitter();
            emitter(this.entityName, action, doc, context);
        } catch {
            // Silently fail — don't break CRUD operations
        }
    }

    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        const saved = await document.save();
        this.emitRealtimeEvent('created', saved);
        return saved;
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findOne({ _id: id, isDeleted: { $ne: true } } as FilterQuery<T>);
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOne({ ...filter, isDeleted: { $ne: true } });
    }

    async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
        return await this.model.find({ ...filter, isDeleted: { $ne: true } });
    }

    async findWithPagination(
        filter: FilterQuery<T>,
        paginationQuery: IPaginationQuery
    ): Promise<IPaginationResult<T>> {
        const { page, limit, skip } = PaginationUtil.getPaginationParams(paginationQuery);
        const sortOptions = PaginationUtil.getSortOptions(
            paginationQuery.sortBy,
            paginationQuery.sortOrder
        );

        const [data, total] = await Promise.all([
            this.model.find({ ...filter, isDeleted: { $ne: true } }).sort(sortOptions).skip(skip).limit(limit),
            this.model.countDocuments({ ...filter, isDeleted: { $ne: true } }),
        ]);

        return PaginationUtil.buildPaginationResult(data, total, page, limit);
    }

    async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
        const result = await this.model.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } } as FilterQuery<T>,
            data,
            { new: true, runValidators: true } as QueryOptions
        );
        if (result) this.emitRealtimeEvent('updated', result);
        return result;
    }

    async delete(id: string, hardDelete: boolean = false): Promise<boolean> {
        // Fetch the document before deletion for context extraction
        let doc: T | null = null;
        if (this.entityName) {
            doc = await this.findById(id);
        }

        if (hardDelete) {
            const result = await this.model.deleteOne({ _id: id } as FilterQuery<T>);
            const deleted = result.deletedCount > 0;
            if (deleted && doc) this.emitRealtimeEvent('deleted', doc);
            return deleted;
        } else {
            // Soft delete
            const result = await this.model.updateOne(
                { _id: id } as FilterQuery<T>,
                { isDeleted: true, deletedAt: new Date() } as UpdateQuery<T>
            );
            const deleted = result.modifiedCount > 0;
            if (deleted && doc) this.emitRealtimeEvent('deleted', doc);
            return deleted;
        }
    }

    async count(filter: FilterQuery<T> = {}): Promise<number> {
        return await this.model.countDocuments({ ...filter, isDeleted: { $ne: true } });
    }

    async exists(filter: FilterQuery<T>): Promise<boolean> {
        const count = await this.model.countDocuments({ ...filter, isDeleted: { $ne: true } });
        return count > 0;
    }
}
