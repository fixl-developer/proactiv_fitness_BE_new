import { FilterQuery } from 'mongoose';
import { BaseService } from '@shared/base/base.service';
import { HolidayCalendar } from './holiday-calendar.model';
import { IHolidayCalendar, IHolidayCalendarCreate, IHolidayCalendarUpdate, IHolidayCalendarQuery } from './bcms.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class HolidayCalendarService extends BaseService<IHolidayCalendar> {
    constructor() {
        super(HolidayCalendar);
    }

    async createHolidayCalendar(data: IHolidayCalendarCreate): Promise<IHolidayCalendar> {
        const existing = await HolidayCalendar.findOne({
            year: data.year,
            countryId: data.countryId,
            regionId: data.regionId || null
        });

        if (existing) {
            throw new AppError('Holiday calendar already exists for this year and location', HTTP_STATUS.CONFLICT);
        }

        return await this.create(data as Partial<IHolidayCalendar>);
    }

    async getHolidayCalendars(query: IHolidayCalendarQuery): Promise<IHolidayCalendar[]> {
        const filter: FilterQuery<IHolidayCalendar> = {};

        if (query.countryId) filter.countryId = query.countryId;
        if (query.regionId) filter.regionId = query.regionId;
        if (query.year) filter.year = query.year;
        if (query.isActive !== undefined) filter.isActive = query.isActive;

        return await this.findAll(filter);
    }

    async getHolidayCalendarById(id: string): Promise<IHolidayCalendar | null> {
        return await this.findById(id);
    }

    async updateHolidayCalendar(id: string, data: IHolidayCalendarUpdate): Promise<IHolidayCalendar | null> {
        const calendar = await this.update(id, data);
        if (!calendar) {
            throw new AppError('Holiday calendar not found', HTTP_STATUS.NOT_FOUND);
        }
        return calendar;
    }

    async deleteHolidayCalendar(id: string): Promise<boolean> {
        return await this.delete(id);
    }
}

export default new HolidayCalendarService();
