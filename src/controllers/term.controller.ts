import { Request, Response } from 'express';
import { BaseController } from '../shared/base/base.controller';
import termService from '../modules/bcms/term.service';
import { ITermCreate, ITermUpdate, ITermQuery } from '../modules/bcms/bcms.interface';

export class TermController extends BaseController {
    async create(req: Request, res: Response) {
        const data: ITermCreate = req.body;
        const term = await termService.createTerm(data);
        return this.sendCreated(res, term, 'Term created successfully');
    }

    async getAll(req: Request, res: Response) {
        const query: ITermQuery & { search?: string } = {
            locationId: req.query.locationId as string,
            year: req.query.year ? parseInt(req.query.year as string) : undefined,
            search: req.query.search as string,
        };
        if (req.query.isActive !== undefined && req.query.isActive !== '') {
            query.isActive = req.query.isActive === 'true';
        }

        const terms = await termService.getTerms(query);
        return this.sendSuccess(res, terms);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const term = await termService.getTermById(id);

        if (!term) {
            return this.sendNotFound(res, 'Term not found');
        }

        return this.sendSuccess(res, term);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: ITermUpdate = req.body;

        const term = await termService.updateTerm(id, data);

        if (!term) {
            return this.sendNotFound(res, 'Term not found');
        }

        return this.sendSuccess(res, term, 'Term updated successfully');
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await termService.deleteTerm(id);

        if (!result) {
            return this.sendNotFound(res, 'Term not found');
        }

        return this.sendSuccess(res, null, 'Term deleted successfully');
    }
}

export default new TermController();