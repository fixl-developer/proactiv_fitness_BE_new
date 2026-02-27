import { Request, Response } from 'express';
import { BaseController } from '../shared/base/base.controller';
import regionService from '../modules/bcms/region.service';
import { IRegionCreate, IRegionUpdate, IRegionQuery } from '../modules/bcms/bcms.interface';

export class RegionController extends BaseController {
    async create(req: Request, res: Response) {
        const data: IRegionCreate = req.body;
        const region = await regionService.createRegion(data);
        return this.sendCreated(res, region, 'Region created successfully');
    }

    async getAll(req: Request, res: Response) {
        const query: IRegionQuery = {
            countryId: req.query.countryId as string,
            isActive: req.query.isActive === 'true',
            search: req.query.search as string,
        };

        const regions = await regionService.getRegions(query);
        return this.sendSuccess(res, regions);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const region = await regionService.getRegionById(id);

        if (!region) {
            return this.sendNotFound(res, 'Region not found');
        }

        return this.sendSuccess(res, region);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: IRegionUpdate = req.body;

        const region = await regionService.updateRegion(id, data);

        if (!region) {
            return this.sendNotFound(res, 'Region not found');
        }

        return this.sendSuccess(res, region, 'Region updated successfully');
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await regionService.deleteRegion(id);

        if (!result) {
            return this.sendNotFound(res, 'Region not found');
        }

        return this.sendSuccess(res, null, 'Region deleted successfully');
    }
}

export default new RegionController();