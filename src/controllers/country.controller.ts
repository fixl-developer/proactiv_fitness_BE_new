import { Request, Response } from 'express';
import { BaseController } from '../shared/base/base.controller';
import countryService from '../modules/bcms/country.service';
import { ICountryCreate, ICountryUpdate, ICountryQuery } from '../modules/bcms/bcms.interface';

export class CountryController extends BaseController {
    async create(req: Request, res: Response) {
        const data: ICountryCreate = req.body;
        const country = await countryService.createCountry(data);
        return this.sendCreated(res, country, 'Country created successfully');
    }

    async getAll(req: Request, res: Response) {
        // Only apply isActive filter if explicitly provided (otherwise list ALL statuses).
        const query: ICountryQuery = {
            search: req.query.search as string,
        };
        if (req.query.isActive !== undefined && req.query.isActive !== '') {
            query.isActive = req.query.isActive === 'true';
        }

        const countries = await countryService.getCountries(query);
        return this.sendSuccess(res, countries);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const country = await countryService.getCountryById(id);

        if (!country) {
            return this.sendNotFound(res, 'Country not found');
        }

        return this.sendSuccess(res, country);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: ICountryUpdate = req.body;

        const country = await countryService.updateCountry(id, data);

        if (!country) {
            return this.sendNotFound(res, 'Country not found');
        }

        return this.sendSuccess(res, country, 'Country updated successfully');
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await countryService.deleteCountry(id);

        if (!result) {
            return this.sendNotFound(res, 'Country not found');
        }

        return this.sendSuccess(res, null, 'Country deleted successfully');
    }
}

export default new CountryController();