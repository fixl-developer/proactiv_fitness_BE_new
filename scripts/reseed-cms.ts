/**
 * Run via ts-node so it picks up the (now corrected) src/modules/cms/cms.seeder.ts.
 *
 * Usage:
 *   cd backend && npx ts-node -r tsconfig-paths/register scripts/reseed-cms.ts
 *
 * - `clear=true` arg flag will wipe all CMS collections first (uses CMSSeeder.clearAll).
 *   Otherwise insertMany skips collections that already have any data — same as the
 *   admin /seed endpoint.
 */
import mongoose from 'mongoose';
import { CMSSeeder } from '../src/modules/cms/cms.seeder';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness_db';

(async () => {
    const args = process.argv.slice(2);
    const clearFirst = args.includes('clear=true') || args.includes('--clear');

    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    if (clearFirst) {
        console.log('Clearing all CMS collections...');
        const cleared = await CMSSeeder.clearAll();
        console.log('Cleared:', cleared.join(', '), '\n');
    }

    const result = await CMSSeeder.seedAll();
    console.log('Seeded:', result.seeded.join(', ') || '(nothing new)');
    console.log('Skipped:', result.skipped.join(', ') || '(nothing skipped)');

    await mongoose.disconnect();
    process.exit(0);
})().catch(err => {
    console.error('Seed script failed:', err);
    process.exit(1);
});
