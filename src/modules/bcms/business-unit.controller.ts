import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import businessUnitService from './business-unit.service';
import { IBusinessUnitCreate, IBusinessUnitUpdate, IBusinessUnitQuery } from './bcms.interface';

export class BusinessUnitController extends BaseController {
    async create(req: Request, res: Response) {
        const data: IBusinessUnitCreate = req.body;
        const businessUnit = await businessUnitService.createBusinessUnit(data);
        return this.sendCreated(res, businessUnit, 'Business unit created successfully');
    }

    async getAll(req: Request, res: Response) {
        // Only apply isActive filter if explicitly provided (otherwise list ALL statuses).
        const query: IBusinessUnitQuery = {
            countryId: req.query.countryId as string,
            regionId: req.query.regionId as string,
            type: req.query.type as any,
            search: req.query.search as string,
        };
        if (req.query.isActive !== undefined && req.query.isActive !== '') {
            query.isActive = req.query.isActive === 'true';
        }

        const businessUnits = await businessUnitService.getBusinessUnits(query);
        return this.sendSuccess(res, businessUnits);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const businessUnit = await businessUnitService.getBusinessUnitById(id);

        if (!businessUnit) {
            return this.sendNotFound(res, 'Business unit not found');
        }

        return this.sendSuccess(res, businessUnit);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: IBusinessUnitUpdate = req.body;
        const businessUnit = await businessUnitService.updateBusinessUnit(id, data);

        if (!businessUnit) {
            return this.sendNotFound(res, 'Business unit not found');
        }

        return this.sendSuccess(res, businessUnit, 'Business unit updated successfully');
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await businessUnitService.deleteBusinessUnit(id);

        if (!result) {
            return this.sendNotFound(res, 'Business unit not found');
        }

        return this.sendSuccess(res, null, 'Business unit deleted successfully');
    }
}

export default new BusinessUnitController();
