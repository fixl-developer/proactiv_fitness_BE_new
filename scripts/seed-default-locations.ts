/**
 * Idempotently ensures the two flagship ProGym locations — Cyberport and
 * Wan Chai — exist in the BCMS Locations collection so they appear in the
 * landing-page header dropdown (which reads /api/v1/public/locations) and
 * the admin Locations table (/admin/business-config/locations).
 *
 * The header was originally hard-coded with these two entries as a fallback.
 * Once admins started creating their own locations, the live API list took
 * over and Cyberport/Wan Chai disappeared because nobody had ever inserted
 * them through the admin form. This script restores them with the correct
 * nested schema (address.{...}, contactInfo.{...}) so they're treated as
 * first-class admin-managed locations going forward.
 *
 * Idempotency: matches existing docs by name (case-insensitive). Re-running
 * is safe — already-correct rows are left as-is, malformed legacy rows get
 * their fields rewritten to match the Mongoose schema.
 *
 * Codes are 'CYBERPORT' and 'WAN-CHAI' so the auto-derived slug in
 * public.routes.ts matches the existing /locations/cyberport and
 * /locations/wan-chai static pages.
 *
 * Usage:
 *   cd backend && npx ts-node -r tsconfig-paths/register scripts/seed-default-locations.ts
 */
import mongoose from 'mongoose';
import { Country } from '../src/modules/bcms/country.model';
import { BusinessUnit } from '../src/modules/bcms/business-unit.model';
import { Location } from '../src/modules/bcms/location.model';
import { LocationStatus, BusinessUnitType } from '../src/shared/enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness_db';

async function ensureCountry() {
    const existing = await Country.findOne({ code: 'HK' });
    if (existing) {
        console.log(`  Country: Hong Kong (HK) — already present (${existing._id})`);
        return existing;
    }
    const created = await Country.create({
        name: 'Hong Kong',
        code: 'HK',
        currency: 'HKD',
        timezone: 'Asia/Hong_Kong',
        isActive: true,
    });
    console.log(`  Country: Hong Kong (HK) — created (${created._id})`);
    return created;
}

async function ensureBusinessUnit(countryId: mongoose.Types.ObjectId) {
    const existing = await BusinessUnit.findOne({ code: 'HK-PG' });
    if (existing) {
        console.log(`  BusinessUnit: ProGym Hong Kong (HK-PG) — already present (${existing._id})`);
        return existing;
    }
    const created = await BusinessUnit.create({
        name: 'ProGym Hong Kong',
        code: 'HK-PG',
        type: BusinessUnitType.GYM,
        countryId,
        isActive: true,
    });
    console.log(`  BusinessUnit: ProGym Hong Kong (HK-PG) — created (${created._id})`);
    return created;
}

interface SeedLocationInput {
    code: string;
    name: string;
    legacyCodes: string[]; // codes used by older broken seed runs
    address: {
        street: string;
        city: string;
        state?: string;
        country: string;
        postalCode: string;
    };
    contactInfo: { email: string; phone: string };
    capacity: number;
    facilities: string[];
}

async function upsertLocation(
    input: SeedLocationInput,
    businessUnitId: mongoose.Types.ObjectId,
    countryId: mongoose.Types.ObjectId
) {
    // Match by name first (case-insensitive). Falls through to legacy code
    // matches so any doc inserted by the old flat-shape seed gets healed
    // rather than left behind as a duplicate.
    const escapedName = input.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Location.findOne({
        $or: [
            { name: { $regex: new RegExp(`^${escapedName}$`, 'i') } },
            { code: { $in: [input.code, ...input.legacyCodes] } },
        ],
    });

    const payload = {
        name: input.name,
        code: input.code,
        businessUnitId,
        countryId,
        address: input.address,
        contactInfo: input.contactInfo,
        capacity: input.capacity,
        facilities: input.facilities,
        status: LocationStatus.ACTIVE,
        isDeleted: false,
    };

    if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        console.log(`  Location: ${input.name} (${input.code}) — updated (${existing._id})`);
    } else {
        const created = await Location.create(payload);
        console.log(`  Location: ${input.name} (${input.code}) — created (${created._id})`);
    }
}

(async () => {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    console.log('Ensuring reference data...');
    const country = await ensureCountry();
    const businessUnit = await ensureBusinessUnit(country._id as mongoose.Types.ObjectId);

    console.log('\nUpserting flagship locations...');
    await upsertLocation(
        {
            code: 'CYBERPORT',
            name: 'Cyberport',
            legacyCodes: ['CP-01'],
            address: {
                street: 'Shop 123, Cyberport 3, 100 Cyberport Road',
                city: 'Hong Kong',
                state: 'Hong Kong',
                country: 'Hong Kong',
                postalCode: '00000',
            },
            contactInfo: {
                email: 'cyberport@proactivsports.net',
                phone: '+852 22345678',
            },
            capacity: 100,
            facilities: ['Gym', 'Locker Rooms', 'Parking', 'Reception', 'Party Room'],
        },
        businessUnit._id as mongoose.Types.ObjectId,
        country._id as mongoose.Types.ObjectId
    );

    await upsertLocation(
        {
            code: 'WAN-CHAI',
            name: 'Wan Chai',
            legacyCodes: ['WC-01'],
            address: {
                street: '5/F, 168 Hennessy Road',
                city: 'Wan Chai',
                state: 'Hong Kong',
                country: 'Hong Kong',
                postalCode: '00000',
            },
            contactInfo: {
                email: 'wanchai@proactivsports.net',
                phone: '+852 23456789',
            },
            capacity: 80,
            facilities: ['Gym', 'Locker Rooms', 'Parent Lounge', 'Multi-Purpose Room'],
        },
        businessUnit._id as mongoose.Types.ObjectId,
        country._id as mongoose.Types.ObjectId
    );

    await mongoose.disconnect();
    console.log('\nDone.');
    process.exit(0);
})().catch(async (err) => {
    console.error('Seed script failed:', err);
    try { await mongoose.disconnect(); } catch { /* ignore */ }
    process.exit(1);
});
