import { FilterQuery } from 'mongoose';
import { BaseService } from '@shared/base/base.service';
import { Term } from './term.model';
import { ITerm, ITermCreate, ITermUpdate, ITermQuery } from './bcms.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class TermService extends BaseService<ITerm> {
    constructor() {
        super(Term);
    }

    async createTerm(data: ITermCreate): Promise<ITerm> {
        const existing = await Term.findOne({ code: data.code });

        if (existing) {
            throw new AppError('Term with this code already exists', HTTP_STATUS.CONFLICT);
        }

        // Calculate weeks
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const weeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        return await this.create({ ...data, weeks } as Partial<ITerm>);
    }

    async getTerms(query: ITermQuery): Promise<ITerm[]> {
        const filter: FilterQuery<ITerm> = {};

        if (query.businessUnitId) filter.businessUnitId = query.businessUnitId;
        if (query.locationId) filter.locationId = query.locationId;
        if (query.isActive !== undefined) filter.isActive = query.isActive;
        if (query.allowEnrollment !== undefined) filter.allowEnrollment = query.allowEnrollment;

        if (query.year) {
            const yearStart = new Date(query.year, 0, 1);
            const yearEnd = new Date(query.year, 11, 31);
            filter.startDate = { $gte: yearStart, $lte: yearEnd };
        }

        if (query.current) {
            const now = new Date();
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
        }

        return await this.findAll(filter);
    }

    async getTermById(id: string): Promise<ITerm | null> {
        return await this.findById(id);
    }

    async updateTerm(id: string, data: ITermUpdate): Promise<ITerm | null> {
        const term = await this.update(id, data);
        if (!term) {
            throw new AppError('Term not found', HTTP_STATUS.NOT_FOUND);
        }
        return term;
    }

    async deleteTerm(id: string): Promise<boolean> {
        return await this.delete(id);
    }
}

export default new TermService();
