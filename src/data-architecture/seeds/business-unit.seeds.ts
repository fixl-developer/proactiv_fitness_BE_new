import { Types } from 'mongoose';
import { SeedData } from './seed-data.interface';
import { COLLECTIONS } from '../constants';

export const businessUnitSeedData: SeedData = {
    collection: COLLECTIONS.BUSINESS_UNITS,
    environment: 'all',
    idempotent: true,
    uniqueField: 'code',
    data: [
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439031'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439021'),
            name: 'Proactiv HQ',
            code: 'US-HQ',
            type: 'headquarters',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439032'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439021'),
            name: 'NYC Franchise',
            code: 'US-NYC-FR',
            type: 'franchise',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439033'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439013'),
            regionId: new Types.ObjectId('507f1f77bcf86cd799439023'),
            name: 'Tokyo Elite Academy',
            code: 'JP-TK-EA',
            type: 'elite_academy',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
};