import { FilterQuery } from 'mongoose';
import { BaseService } from '@shared/base/base.service';
import { Location } from './location.model';
import { ILocation, ILocationCreate, ILocationUpdate, ILocationQuery } from './bcms.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class LocationService extends BaseService<ILocation> {
    constructor() {
        super(Location);
    }

    async createLocation(data: ILocationCreate): Promise<ILocation> {
        const existing = await Location.findOne({ code: data.code });

        if (existing) {
            throw new AppError('Location with this code already exists', HTTP_STATUS.CONFLICT);
        }

        return await this.create(data as Partial<ILocation>);
    }

    async getLocations(query: ILocationQuery): Promise<ILocation[]> {
        const filter: FilterQuery<ILocation> = {};

        if (query.businessUnitId) filter.businessUnitId = query.businessUnitId;
        if (query.countryId) filter.countryId = query.countryId;
        if (query.regionId) filter.regionId = query.regionId;
        if (query.status) filter.status = query.status;

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } },
            ];
        }

        return await this.findAll(filter);
    }

    async getLocationById(id: string): Promise<ILocation | null> {
        return await this.findById(id);
    }

    async updateLocation(id: string, data: ILocationUpdate): Promise<ILocation | null> {
        const location = await this.update(id, data);
        if (!location) {
            throw new AppError('Location not found', HTTP_STATUS.NOT_FOUND);
        }
        return location;
    }

    async deleteLocation(id: string): Promise<boolean> {
        return await this.delete(id);
    }
}

export default new LocationService();
