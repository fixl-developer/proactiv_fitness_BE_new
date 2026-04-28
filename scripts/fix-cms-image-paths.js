/**
 * One-time data-fix: rewrite CMS records whose image/logo paths point to files
 * that don't exist in /frontend/public/. Maps to existing files where possible,
 * and clears the field otherwise so component fallbacks (gradient + text) render.
 *
 * Run: node backend/scripts/fix-cms-image-paths.js
 */
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness_db';

const HERO_MAP = {
    '/images/hero-1.jpg': '/images/hero/gymnastics-1.jpg',
    '/images/hero-2.jpg': '/images/hero/gymnastics-2.jpg',
    '/images/hero-3.jpg': '/images/hero/gymnastics-3.jpg',
    '/images/hero-4.jpg': '/images/hero/gymnastics-4.png',
    '/images/hero-5.jpg': '/images/hero/gymnastics-5.jpg',
};

const SERVICE_MAP = {
    '/images/services/gymnastics.jpg': '/images/services/school-gymnastics.jpg',
    '/images/services/camps.jpg': '/images/services/holiday-camps.jpg',
    '/images/services/multi-activity.jpg': '/images/services/private-coaching.jpg',
    '/images/services/parties.jpg': '/images/services/birthday-parties.jpg',
};

// Folders without any committed images — clear the field so the component fallback renders.
const CLEAR_PREFIXES = [
    '/images/partners/',
    '/images/clients/',
    '/images/assessments/',
    '/images/classes/',
    '/images/programs/',
    '/images/camps/',
    '/images/parties/',
    '/images/blog/',
];

function shouldClear(value) {
    if (typeof value !== 'string') return false;
    return CLEAR_PREFIXES.some(p => value.startsWith(p));
}

async function fixCollection(collName, fieldName, mapping) {
    const coll = mongoose.connection.db.collection(collName);
    const docs = await coll.find({}).toArray();
    let updated = 0;
    for (const doc of docs) {
        const cur = doc[fieldName];
        if (typeof cur !== 'string' || !cur) continue;
        let next = cur;
        if (mapping && mapping[cur]) next = mapping[cur];
        else if (shouldClear(cur)) next = '';
        if (next !== cur) {
            await coll.updateOne({ _id: doc._id }, { $set: { [fieldName]: next } });
            updated++;
            console.log(`  [${collName}] ${doc._id}: "${cur}" -> "${next}"`);
        }
    }
    console.log(`  -> ${updated} records updated in ${collName}`);
    return updated;
}

(async () => {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    let total = 0;
    total += await fixCollection('cms_hero_slides', 'image', HERO_MAP);
    total += await fixCollection('cms_service_cards', 'image', SERVICE_MAP);
    total += await fixCollection('cms_client_partners', 'logo', null);
    total += await fixCollection('cms_assessments', 'image', null);
    total += await fixCollection('cms_class_sessions', 'image', null);
    total += await fixCollection('cms_program_levels', 'image', null);
    total += await fixCollection('cms_camp_programs', 'image', null);
    total += await fixCollection('cms_party_packages', 'image', null);
    total += await fixCollection('cms_blog_posts', 'image', null);

    console.log(`\nDone. Total updates: ${total}`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(err => {
    console.error('Fix script failed:', err);
    process.exit(1);
});
