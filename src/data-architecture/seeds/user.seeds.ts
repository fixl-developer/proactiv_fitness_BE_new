import { Types } from 'mongoose';
import { SeedData } from './seed-data.interface';
import { COLLECTIONS } from '../constants';

export const userSeedData: SeedData = {
    collection: COLLECTIONS.USERS,
    environment: 'development',
    idempotent: true,
    uniqueField: 'email',
    data: [
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439051'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            email: 'admin@proactiv.com',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'super_admin',
            permissions: ['*'],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439052'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439021'),
            email: 'manager@nyc.proactiv.com',
            firstName: 'John',
            lastName: 'Manager',
            role: 'franchise_manager',
            permissions: ['franchise:read', 'franchise:write', 'location:read', 'location:write'],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439053'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439021'),
            businessUnitId: new Types.ObjectId('507f1f77bcf86cd799439032'),
            locationId: new Types.ObjectId('507f1f77bcf86cd799439041'),
            email: 'coach@manhattan.proactiv.com',
            firstName: 'Sarah',
            lastName: 'Coach',
            role: 'coach',
            permissions: ['session:read', 'session:write', 'attendance:read', 'attendance:write'],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
};