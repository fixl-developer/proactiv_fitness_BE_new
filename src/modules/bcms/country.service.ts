import { FilterQuery } from 'mongoose';
import { BaseService } from '@shared/base/base.service';
import { Country } from './country.model';
import { ICountry, ICountryCreate, ICountryUpdate, ICountryQuery } from './bcms.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class CountryService extends BaseService<ICountry> {
    constructor() {
        super(Country);
    }

    async createCountry(data: ICountryCreate): Promise<ICountry> {
        const existing = await Country.findOne({
            $or: [{ code: data.code.toUpperCase() }, { name: data.name }]
        });

        if (existing) {
            throw new AppError('Country with this code or name already exists', HTTP_STATUS.CONFLICT);
        }

        return await this.create(data as Partial<ICountry>);
    }

    async getCountries(query: ICountryQuery): Promise<ICountry[]> {
        const filter: FilterQuery<ICountry> = {};

        if (query.isActive !== undefined) filter.isActive = query.isActive;

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } },
            ];
        }

        return await this.findAll(filter);
    }

    async getCountryById(id: string): Promise<ICountry | null> {
        return await this.findById(id);
    }

    async getCountryByCode(code: string): Promise<ICountry | null> {
        return await Country.findOne({ code: code.toUpperCase(), isDeleted: false });
    }

    async updateCountry(id: string, data: ICountryUpdate): Promise<ICountry | null> {
        const country = await this.update(id, data);
        if (!country) {
            throw new AppError('Country not found', HTTP_STATUS.NOT_FOUND);
        }
        return country;
    }

    async deleteCountry(id: string): Promise<boolean> {
        return await this.delete(id);
    }
}

export default new CountryService();
