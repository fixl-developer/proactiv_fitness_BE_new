/**
 * Force-overwrites the PageContent and LocationDetail collections with the
 * comprehensive seed data defined in src/modules/cms/cms.seeder.ts.
 *
 * Existing documents matched by slug are FULLY REPLACED — section content,
 * facilities, schedule, hours, and team are all reset to the seed values.
 * Documents with slugs not in the seed are left untouched.
 *
 * Other CMS collections (testimonials, blog posts, FAQs, services, etc.)
 * are NOT modified by this script — use reseed-cms.ts for the full reseed.
 *
 * Usage:
 *   cd backend && npx ts-node -r tsconfig-paths/register scripts/reseed-pages-and-locations.ts
 */
import mongoose from 'mongoose';
import { CMSSeeder } from '../src/modules/cms/cms.seeder';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness_db';

(async () => {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    console.log('Upserting Page Contents and Location Details...');
    const result = await CMSSeeder.upsertPagesAndLocations();
    console.log('Upserted Page Contents:', result.pageContents.join(', '));
    console.log('Upserted Locations:    ', result.locations.join(', '));

    await mongoose.disconnect();
    console.log('\nDone.');
    process.exit(0);
})().catch(err => {
    console.error('Reseed script failed:', err);
    process.exit(1);
});
