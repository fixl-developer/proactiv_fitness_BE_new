/**
 * Read-only verification: prints what GET /api/v1/public/locations would
 * return, plus the raw shape of Cyberport and Wan Chai docs, to confirm
 * seed-default-locations.ts wrote nested address/contactInfo properly.
 *
 * Usage:
 *   cd backend && MONGODB_URI=... npx ts-node -r tsconfig-paths/register scripts/verify-default-locations.ts
 */
import mongoose from 'mongoose';
import { Location } from '../src/modules/bcms/location.model';
import { LocationStatus } from '../src/shared/enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness_db';

(async () => {
    await mongoose.connect(MONGODB_URI);

    const docs = await Location.find({
        status: { $ne: LocationStatus.INACTIVE },
        isDeleted: { $ne: true },
    })
        .select('name code address contactInfo capacity status')
        .sort({ name: 1 })
        .lean();

    console.log(`\nPublic /locations would return ${docs.length} rows:\n`);
    for (const d of docs as any[]) {
        const slug = String(d.code || d.name || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        console.log(`  - ${d.name.padEnd(28)} code=${(d.code || '-').padEnd(14)} slug=${slug}`);
    }

    console.log('\nFlagship docs (nested-shape check):');
    for (const target of ['Cyberport', 'Wan Chai']) {
        const doc = await Location.findOne({ name: target }).lean();
        if (!doc) {
            console.log(`  ${target}: NOT FOUND`);
            continue;
        }
        console.log(`  ${target}:`);
        console.log(`    code:        ${(doc as any).code}`);
        console.log(`    status:      ${(doc as any).status}`);
        console.log(`    address:     ${JSON.stringify((doc as any).address)}`);
        console.log(`    contactInfo: ${JSON.stringify((doc as any).contactInfo)}`);
        console.log(`    capacity:    ${(doc as any).capacity}`);
        console.log(`    BU/Country:  ${(doc as any).businessUnitId} / ${(doc as any).countryId}`);
    }

    await mongoose.disconnect();
    process.exit(0);
})().catch(async (err) => {
    console.error('Verification failed:', err);
    try { await mongoose.disconnect(); } catch { /* ignore */ }
    process.exit(1);
});
