import { FilterQuery } from 'mongoose';
import { BaseService } from '@shared/base/base.service';
import { BusinessUnit } from './business-unit.model';
import { IBusinessUnit, IBusinessUnitCreate, IBusinessUnitUpdate, IBusinessUnitQuery } from './bcms.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class BusinessUnitService extends BaseService<IBusinessUnit> {
    constructor() {
        super(BusinessUnit);
    }

    async createBusinessUnit(data: IBusinessUnitCreate): Promise<IBusinessUnit> {
        const existing = await BusinessUnit.findOne({ code: data.code });

        if (existing) {
            throw new AppError('Business unit with this code already exists', HTTP_STATUS.CONFLICT);
        }

        return await this.create(data as Partial<IBusinessUnit>);
    }

    async getBusinessUnits(query: IBusinessUnitQuery): Promise<IBusinessUnit[]> {
        const filter: FilterQuery<IBusinessUnit> = {};

        if (query.countryId) filter.countryId = query.countryId;
        if (query.regionId) filter.regionId = query.regionId;
        if (query.type) filter.type = query.type;
        if (query.isActive !== undefined) filter.isActive = query.isActive;

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } },
            ];
        }

        return await this.findAll(filter);
    }

    async getBusinessUnitById(id: string): Promise<IBusinessUnit | null> {
        return await this.findById(id);
    }

    async updateBusinessUnit(id: string, data: IBusinessUnitUpdate): Promise<IBusinessUnit | null> {
        const businessUnit = await this.update(id, data);
        if (!businessUnit) {
            throw new AppError('Business unit not found', HTTP_STATUS.NOT_FOUND);
        }
        return businessUnit;
    }

    async deleteBusinessUnit(id: string): Promise<boolean> {
        return await this.delete(id);
    }
}

export default new BusinessUnitService();
