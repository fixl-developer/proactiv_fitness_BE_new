import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import locationService from './location.service';
import { ILocationCreate, ILocationUpdate, ILocationQuery } from './bcms.interface';

export class LocationController extends BaseController {
    async create(req: Request, res: Response) {
        const data: ILocationCreate = req.body;
        const location = await locationService.createLocation(data);
        return this.sendCreated(res, location, 'Location created successfully');
    }

    async getAll(req: Request, res: Response) {
        const query: ILocationQuery = {
            businessUnitId: req.query.businessUnitId as string,
            countryId: req.query.countryId as string,
            regionId: req.query.regionId as string,
            status: req.query.status as any,
            search: req.query.search as string,
        };

        const locations = await locationService.getLocations(query);
        return this.sendSuccess(res, locations);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const location = await locationService.getLocationById(id);

        if (!location) {
            return this.sendNotFound(res, 'Location not found');
        }

        return this.sendSuccess(res, location);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: ILocationUpdate = req.body;
        const location = await locationService.updateLocation(id, data);

        if (!location) {
            return this.sendNotFound(res, 'Location not found');
        }

        return this.sendSuccess(res, location, 'Location updated successfully');
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await locationService.deleteLocation(id);

        if (!result) {
            return this.sendNotFound(res, 'Location not found');
        }

        return this.sendSuccess(res, null, 'Location deleted successfully');
    }
}

export default new LocationController();
