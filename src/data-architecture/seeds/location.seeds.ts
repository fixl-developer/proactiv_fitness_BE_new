import { Types } from 'mongoose';
import { SeedData } from './seed-data.interface';
import { COLLECTIONS } from '../constants';

export const locationSeedData: SeedData = {
    collection: COLLECTIONS.LOCATIONS,
    environment: 'all',
    idempotent: true,
    uniqueField: 'code',
    data: [
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439041'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439021'),
            businessUnitId: new Types.ObjectId('507f1f77bcf86cd799439032'),
            name: 'Manhattan Center',
            code: 'NYC-MAN-01',
            address: '123 Broadway, New York, NY 10001',
            capacity: 150,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439042'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439021'),
            businessUnitId: new Types.ObjectId('507f1f77bcf86cd799439032'),
            name: 'Brooklyn Center',
            code: 'NYC-BRK-01',
            address: '456 Atlantic Ave, Brooklyn, NY 11201',
            capacity: 120,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439043'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439013'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439023'),
            businessUnitId: new Types.ObjectId('507f1f77bcf86cd799439033'),
            name: 'Shibuya Elite Center',
            code: 'TK-SHB-01',
            address: '1-1-1 Shibuya, Tokyo 150-0002',
            capacity: 200,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
};