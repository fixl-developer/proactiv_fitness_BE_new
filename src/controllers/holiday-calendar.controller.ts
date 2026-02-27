import { Request, Response } from 'express';
import { BaseController } from '../shared/base/base.controller';
import holidayCalendarService from '../modules/bcms/holiday-calendar.service';
import { IHolidayCalendarCreate, IHolidayCalendarUpdate, IHolidayCalendarQuery } from '../modules/bcms/bcms.interface';

export class HolidayCalendarController extends BaseController {
    async create(req: Request, res: Response) {
        const data: IHolidayCalendarCreate = req.body;
        const holidayCalendar = await holidayCalendarService.createHolidayCalendar(data);
        return this.sendCreated(res, holidayCalendar, 'Holiday calendar created successfully');
    }

    async getAll(req: Request, res: Response) {
        const query: IHolidayCalendarQuery = {
            regionId: req.query.regionId as string,
            year: req.query.year ? parseInt(req.query.year as string) : undefined,
            isActive: req.query.isActive === 'true',
            search: req.query.search as string,
        };

        const holidayCalendars = await holidayCalendarService.getHolidayCalendars(query);
        return this.sendSuccess(res, holidayCalendars);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const holidayCalendar = await holidayCalendarService.getHolidayCalendarById(id);

        if (!holidayCalendar) {
            return this.sendNotFound(res, 'Holiday calendar not found');
        }

        return this.sendSuccess(res, holidayCalendar);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: IHolidayCalendarUpdate = req.body;

        const holidayCalendar = await holidayCalendarService.updateHolidayCalendar(id, data);

        if (!holidayCalendar) {
            return this.sendNotFound(res, 'Holiday calendar not found');
        }

        return this.sendSuccess(res, holidayCalendar, 'Holiday calendar updated successfully');
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