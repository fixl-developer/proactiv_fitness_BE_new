import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IPaginationQuery, IPaginationResult } from '@shared/interfaces/common.interface';
import { PaginationUtil } from '@shared/utils/pagination.util';

export abstract class BaseService<T extends Document> {
    constructor(protected model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        return await document.save();
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
        return await this.model.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } } as FilterQuery<T>,
            data,
            { new: true, runValidators: true } as QueryOptions
        );
    }

    async delete(id: string, hardDelete: boolean = false): Promise<boolean> {
        if (hardDelete) {
            const result = await this.model.deleteOne({ _id: id } as FilterQuery<T>);
            return result.deletedCount > 0;
        } else {
            // Soft delete
            const result = await this.model.updateOne(
                { _id: id } as FilterQuery<T>,
                { isDeleted: true, deletedAt: new Date() } as UpdateQuery<T>
            );
            return result.modifiedCount > 0;
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
