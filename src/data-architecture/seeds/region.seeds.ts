import { Types } from 'mongoose';
import { SeedData } from './seed-data.interface';
import { COLLECTIONS } from '../constants';

export const regionSeedData: SeedData = {
    collection: COLLECTIONS.REGIONS,
    environment: 'all',
    idempotent: true,
    uniqueField: 'code',
    data: [
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439021'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            name: 'Northeast',
            code: 'US-NE',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439022'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            name: 'West Coast',
            code: 'US-WC',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439023'),
            countryId: new Types.ObjectId('507f1f77bcf86cd799439013'),
            name: 'Kanto',
            code: 'JP-KT',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
};
