import { FilterQuery } from 'mongoose';
import { BaseService } from '@shared/base/base.service';
import { Region } from './region.model';
import { IRegion, IRegionCreate, IRegionUpdate, IRegionQuery } from './bcms.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class RegionService extends BaseService<IRegion> {
    constructor() {
        super(Region);
    }

    async createRegion(data: IRegionCreate): Promise<IRegion> {
        const existing = await Region.findOne({
            code: data.code,
            countryId: data.countryId
        });

        if (existing) {
            throw new AppError('Region with this code already exists in this country', HTTP_STATUS.CONFLICT);
        }

        return await this.create(data as Partial<IRegion>);
    }

    async getRegions(query: IRegionQuery): Promise<IRegion[]> {
        const filter: FilterQuery<IRegion> = {};

        if (query.countryId) filter.countryId = query.countryId;
        if (query.isActive !== undefined) filter.isActive = query.isActive;

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } },
            ];
        }

        return await this.findAll(filter);
    }

    async getRegionById(id: string): Promise<IRegion | null> {
        return await this.findById(id);
    }

    async updateRegion(id: string, data: IRegionUpdate): Promise<IRegion | null> {
        const region = await this.update(id, data);
        if (!region) {
            throw new AppError('Region not found', HTTP_STATUS.NOT_FOUND);
        }
        return region;
    }

    async deleteRegion(id: string): Promise<boolean> {
        return await this.delete(id);
    }
}

export default new RegionService();
