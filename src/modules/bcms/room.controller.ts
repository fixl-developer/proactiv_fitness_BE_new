import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import roomService from './room.service';
import { IRoomCreate, IRoomUpdate, IRoomQuery } from './bcms.interface';

export class RoomController extends BaseController {
    async create(req: Request, res: Response) {
        const data: IRoomCreate = req.body;
        const room = await roomService.createRoom(data);
        return this.sendCreated(res, room, 'Room created successfully');
    }

    async getAll(req: Request, res: Response) {
        // Only apply isActive filter if explicitly provided (otherwise list ALL statuses).
        const query: IRoomQuery = {
            locationId: req.query.locationId as string,
            type: req.query.type as string,
            minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
            search: req.query.search as string,
        };
        if (req.query.isActive !== undefined && req.query.isActive !== '') {
            query.isActive = req.query.isActive === 'true';
        }

        const rooms = await roomService.getRooms(query);
        return this.sendSuccess(res, rooms);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const room = await roomService.getRoomById(id);

        if (!room) {
            return this.sendNotFound(res, 'Room not found');
        }

        return this.sendSuccess(res, room);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: IRoomUpdate = req.body;
        const room = await roomService.updateRoom(id, data);

        if (!room) {
            return this.sendNotFound(res, 'Room not found');
        }

        return this.sendSuccess(res, room, 'Room updated successfully');
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await roomService.deleteRoom(id);

        if (!result) {
            return this.sendNotFound(res, 'Room not found');
        }

        return this.sendSuccess(res, null, 'Room deleted successfully');
    }
}

export default new RoomController();
