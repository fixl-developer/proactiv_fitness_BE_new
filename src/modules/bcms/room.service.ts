import { FilterQuery } from 'mongoose';
import { BaseService } from '@shared/base/base.service';
import { Room } from './room.model';
import { IRoom, IRoomCreate, IRoomUpdate, IRoomQuery } from './bcms.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class RoomService extends BaseService<IRoom> {
    constructor() {
        super(Room);
    }

    async createRoom(data: IRoomCreate): Promise<IRoom> {
        const existing = await Room.findOne({
            code: data.code,
            locationId: data.locationId
        });

        if (existing) {
            throw new AppError('Room with this code already exists in this location', HTTP_STATUS.CONFLICT);
        }

        return await this.create(data as Partial<IRoom>);
    }

    async getRooms(query: IRoomQuery): Promise<IRoom[]> {
        const filter: FilterQuery<IRoom> = {};

        if (query.locationId) filter.locationId = query.locationId;
        if (query.type) filter.type = query.type;
        if (query.isActive !== undefined) filter.isActive = query.isActive;
        if (query.minCapacity) filter.capacity = { $gte: query.minCapacity };

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } },
            ];
        }

        return await this.findAll(filter);
    }

    async getRoomById(id: string): Promise<IRoom | null> {
        return await this.findById(id);
    }

    async updateRoom(id: string, data: IRoomUpdate): Promise<IRoom | null> {
        const room = await this.update(id, data);
        if (!room) {
            throw new AppError('Room not found', HTTP_STATUS.NOT_FOUND);
        }
        return room;
    }

    async deleteRoom(id: string): Promise<boolean> {
        return await this.delete(id);
    }
}

export default new RoomService();
