export * from './seed-data.interface';
export * from './seed-loader';
export * from './country.seeds';
export * from './region.seeds';
export * from './business-unit.seeds';
export * from './location.seeds';
export * from './user.seeds';

// Export all seed data
import { countrySeedData } from './country.seeds';
import { regionSeedData } from './region.seeds';
import { businessUnitSeedData } from './business-unit.seeds';
import { locationSeedData } from './location.seeds';
import { userSeedData } from './user.seeds';

export const allSeedData = [
    countrySeedData,
    regionSeedData,
    businessUnitSeedData,
    locationSeedData,
    userSeedData,
];
