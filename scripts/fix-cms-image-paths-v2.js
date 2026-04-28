/**
 * V2: Replace empty image fields (set by V1 of this fix) with existing public images
 * so every CMS record renders an actual photo instead of a fallback gradient.
 *
 * Run: node backend/scripts/fix-cms-image-paths-v2.js
 */
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness_db';

// Map per-collection: title-keyword (lowercase) -> existing public image path.
// All these files exist in /frontend/public/images/.
const PLANS = {
    cms_assessments: {
        field: 'image',
        byTitle: {
            beginner: '/images/about/img3.jpg',
            intermediate: '/images/about/img5.jpg',
            advanced: '/images/about/img6.jpg',
        },
        fallback: '/images/pages/book-assessment-hero.jpg',
    },
    cms_class_sessions: {
        field: 'image',
        byTitle: {
            tiny: '/images/hero/img1.png',
            junior: '/images/hero/img2.jpg',
            intermediate: '/images/hero/img3.jpg',
            competition: '/images/hero/img4.jpg',
        },
        fallback: '/images/services/school-gymnastics.jpg',
    },
    cms_program_levels: {
        field: 'image',
        nameField: 'name',
        byTitle: {
            mini: '/images/hero/gymnastics-1.jpg',
            foundation: '/images/hero/gymnastics-2.jpg',
            development: '/images/hero/gymnastics-3.jpg',
            elite: '/images/hero/gymnastics-5.jpg',
            tumbling: '/images/hero/gymnastics-4.png',
        },
        fallback: '/images/services/private-coaching.jpg',
    },
    cms_camp_programs: {
        field: 'image',
        byTitle: {
            easter: '/images/services/holiday-camps.jpg',
            summer: '/images/pages/school-gymnastics-hero.jpg',
            christmas: '/images/about/img7.jpg',
        },
        fallback: '/images/services/holiday-camps.jpg',
    },
    cms_party_packages: {
        field: 'image',
        nameField: 'name',
        byTitle: {
            bronze: '/images/services/birthday-parties.jpg',
            silver: '/images/pages/birthday-parties-hero.jpg',
            gold: '/images/pages/book-party-hero.jpg',
        },
        fallback: '/images/services/birthday-parties.jpg',
    },
    cms_blog_posts: {
        field: 'image',
        byTitle: {
            benefits: '/images/pages/about-hero.jpg',
            'first-class': '/images/pages/book-trial-hero.jpg',
            'first ': '/images/pages/book-trial-hero.jpg',
            summer: '/images/pages/school-gymnastics-hero.jpg',
        },
        fallback: '/images/pages/about-hero.jpg',
    },
};

function pickReplacement(plan, doc) {
    const titleSrc = (doc[plan.nameField || 'title'] || '').toString().toLowerCase();
    for (const [kw, path] of Object.entries(plan.byTitle)) {
        if (titleSrc.includes(kw)) return path;
    }
    return plan.fallback;
}

async function fixCollection(collName, plan) {
    const coll = mongoose.connection.db.collection(collName);
    // Only touch records where the field is empty (cleared by V1) or still broken.
    const docs = await coll.find({ $or: [{ [plan.field]: '' }, { [plan.field]: { $exists: false } }] }).toArray();
    let updated = 0;
    for (const doc of docs) {
        const next = pickReplacement(plan, doc);
        await coll.updateOne({ _id: doc._id }, { $set: { [plan.field]: next } });
        const titleVal = doc[plan.nameField || 'title'] || '(no title)';
        console.log(`  [${collName}] "${titleVal}": "" -> "${next}"`);
        updated++;
    }
    console.log(`  -> ${updated} records updated in ${collName}`);
    return updated;
}

(async () => {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    let total = 0;
    for (const [coll, plan] of Object.entries(PLANS)) {
        total += await fixCollection(coll, plan);
    }

    console.log(`\nDone. Total updates: ${total}`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(err => {
    console.error('Fix script failed:', err);
    process.exit(1);
});
