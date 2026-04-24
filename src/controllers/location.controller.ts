import { Request, Response } from 'express';
import { BaseController } from '../shared/base/base.controller';
import locationService from '../modules/bcms/location.service';
import { ILocationCreate, ILocationUpdate, ILocationQuery } from '../modules/bcms/bcms.interface';

export class LocationController extends BaseController {
    async create(req: Request, res: Response) {
        const data: ILocationCreate = req.body;
        const location = await locationService.createLocation(data);
        return this.sendCreated(res, location, 'Location created successfully');
    }

    async getAll(req: Request, res: Response) {
        const query: ILocationQuery & { isActive?: boolean } = {
            businessUnitId: req.query.businessUnitId as string,
            regionId: req.query.regionId as string,
            search: req.query.search as string,
        };
        if (req.query.isActive !== undefined && req.query.isActive !== '') {
            query.isActive = req.query.isActive === 'true';
        }

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