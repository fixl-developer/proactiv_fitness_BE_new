import { Types } from 'mongoose';
import { SeedData } from './seed-data.interface';
import { COLLECTIONS } from '../constants';

export const locationSeedData: SeedData = {
    collection: COLLECTIONS.LOCATIONS,
    environment: 'all',
    idempotent: true,
    uniqueField: 'code',
    data: [],
};