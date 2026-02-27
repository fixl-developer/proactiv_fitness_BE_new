import { Types } from 'mongoose';
import { SeedData } from './seed-data.interface';
import { COLLECTIONS } from '../constants';

export const countrySeedData: SeedData = {
    collection: COLLECTIONS.COUNTRIES,
    environment: 'all',
    idempotent: true,
    uniqueField: 'code',
    data: [
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
            name: 'United States',
            code: 'US',
            currency: 'USD',
            timezone: 'America/New_York',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
            name: 'United Kingdom',
            code: 'GB',
            currency: 'GBP',
            timezone: 'Europe/London',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
            name: 'Japan',
            code: 'JP',
            currency: 'JPY',
            timezone: 'Asia/Tokyo',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
            name: 'Australia',
            code: 'AU',
            currency: 'AUD',
            timezone: 'Australia/Sydney',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
};
