/**
 * Re-seed only the HeroSlide collection from the (updated) CMSSeeder source.
 * Other CMS collections are left untouched.
 *
 * Usage: cd backend && npx ts-node -r tsconfig-paths/register scripts/reseed-hero-slides.ts
 */
import mongoose from 'mongoose';
import { HeroSlide } from '../src/modules/cms/cms.model';
import { CMSSeeder } from '../src/modules/cms/cms.seeder';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness_db';

(async () => {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    const before = await HeroSlide.countDocuments({});
    console.log(`HeroSlide before: ${before} docs`);

    await HeroSlide.deleteMany({});
    console.log('Cleared HeroSlide collection.');

    // seedAll() inserts only into collections that are currently empty, so this
    // re-fills HeroSlide while preserving every other CMS collection.
    const result = await CMSSeeder.seedAll();
    console.log('\nSeeded:', result.seeded.join(', ') || '(nothing)');
    console.log('Skipped:', result.skipped.join(', '));

    const after = await HeroSlide.countDocuments({});
    console.log(`\nHeroSlide after: ${after} docs`);

    await mongoose.disconnect();
    process.exit(0);
})().catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
