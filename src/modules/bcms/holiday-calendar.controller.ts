import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import holidayCalendarService from './holiday-calendar.service';
import { IHolidayCalendarCreate, IHolidayCalendarUpdate, IHolidayCalendarQuery } from './bcms.interface';

export class HolidayCalendarController extends BaseController {
    async create(req: Request, res: Response) {
        const data: IHolidayCalendarCreate = req.body;
        const calendar = await holidayCalendarService.createHolidayCalendar(data);
        return this.sendCreated(res, calendar, 'Holiday calendar created successfully');
    }

    async getAll(req: Request, res: Response) {
        const query: IHolidayCalendarQuery = {
            countryId: req.query.countryId as string,
            regionId: req.query.regionId as string,
            year: req.query.year ? parseInt(req.query.year as string) : undefined,
            isActive: req.query.isActive === 'true',
        };

        const calendars = await holidayCalendarService.getHolidayCalendars(query);
        return this.sendSuccess(res, calendars);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const calendar = await holidayCalendarService.getHolidayCalendarById(id);

        if (!calendar) {
            return this.sendNotFound(res, 'Holiday calendar not found');
        }

        return this.sendSuccess(res, calendar);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: IHolidayCalendarUpdate = req.body;
        const calendar = await holidayCalendarService.updateHolidayCalendar(id, data);

        if (!calendar) {
            return this.sendNotFound(res, 'Holiday calendar not found');
        }

        return this.sendSuccess(res, calendar, 'Holiday calendar updated successfully');
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await holidayCalendarService.deleteHolidayCalendar(id);

        if (!result) {
            return this.sendNotFound(res, 'Holiday calendar not found');
        }

        return this.sendSuccess(res, null, 'Holiday calendar deleted successfully');
    }
}

export default new HolidayCalendarController();
