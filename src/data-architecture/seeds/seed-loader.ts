import { Db } from 'mongodb';
import { SeedData, SeedResult } from './seed-data.interface';
import logger from '../../shared/utils/logger.util';

export class SeedLoader {
    private db: Db;
    private environment: string;

    constructor(db: Db, environment: string = process.env.NODE_ENV || 'development') {
        this.db = db;
        this.environment = environment;
    }

    /**
     * Load seed data
     */
    async loadSeeds(seeds: SeedData[]): Promise<SeedResult[]> {
        const results: SeedResult[] = [];

        // Filter seeds by environment
        const applicableSeeds = seeds.filter(
            (seed) => seed.environment === 'all' || seed.environment === this.environment
        );

        logger.info(
            `Loading ${applicableSeeds.length} seed datasets for environment: ${this.environment}`
        );

        for (const seed of applicableSeeds) {
            const result = await this.loadSeed(seed);
            results.push(result);
        }

        return results;
    }

    /**
     * Load a single seed dataset
     */
    private async loadSeed(seed: SeedData): Promise<SeedResult> {
        logger.info(`Loading seed data for collection: ${seed.collection}`);

        const collection = this.db.collection(seed.collection);
        let inserted = 0;
        let skipped = 0;
        let errors = 0;

        for (const doc of seed.data) {
            try {
                if (seed.idempotent && seed.uniqueField) {
                    // Check if document already exists
                    const existing = await collection.findOne({
                        [seed.uniqueField]: doc[seed.uniqueField],
                    });

                    if (existing) {
                        skipped++;
                        continue;
                    }
                }

                await collection.insertOne(doc);
                inserted++;
            } catch (error) {
                logger.error(`Error inserting seed data into ${seed.collection}:`, error);
                errors++;
            }
        }

        logger.info(
            `Seed data loaded for ${seed.collection}: ${inserted} inserted, ${skipped} skipped, ${errors} errors`
        );

        return {
            collection: seed.collection,
            inserted,
            skipped,
            errors,
        };
    }

    /**
     * Clear all data from collections (use with caution!)
     */
    async clearCollections(collections: string[]): Promise<void> {
        logger.warn(`Clearing ${collections.length} collections`);

        for (const collectionName of collections) {
            const collection = this.db.collection(collectionName);
            await collection.deleteMany({});
            logger.info(`Cleared collection: ${collectionName}`);
        }
    }
}
