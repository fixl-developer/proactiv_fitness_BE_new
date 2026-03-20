#!/usr/bin/env node

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { SeedLoader, allSeedData, demoUsers } from '../../data-architecture/seeds';
import { User } from '../../modules/iam/user.model';

config();

async function runSeeds() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Failed to get database instance');
    }

    // Seed countries, regions, business units, locations
    const loader = new SeedLoader(db as any);
    console.log('🌱 Running structure seeds...');
    const results = await loader.loadSeeds(allSeedData);
    for (const result of results) {
        console.log(`✅ ${result.collection}: ${result.inserted} inserted, ${result.skipped} skipped, ${result.errors} errors`);
    }

    // Seed users via Mongoose model so passwords get bcrypt-hashed
    console.log('👥 Seeding demo users...');
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const userData of demoUsers) {
        try {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
                // Update role, status, isEmailVerified if they changed
                const updates: any = {};
                if (existing.role !== userData.role) updates.role = userData.role;
                if (existing.status !== userData.status) updates.status = userData.status;
                if (!existing.isEmailVerified && userData.isEmailVerified) updates.isEmailVerified = true;
                if (userData.firstName && existing.firstName !== userData.firstName) updates.firstName = userData.firstName;
                if (userData.lastName && existing.lastName !== userData.lastName) updates.lastName = userData.lastName;

                if (Object.keys(updates).length > 0) {
                    await User.updateOne({ _id: existing._id }, { $set: updates });
                    console.log(`  🔄 ${userData.email} — updated: ${Object.keys(updates).join(', ')}`);
                } else {
                    console.log(`  ⏭  ${userData.email} (${userData.role}) — already up to date`);
                }
                skipped++;
                continue;
            }
            await User.create(userData);
            console.log(`  ✅ ${userData.email} (${userData.role}) — created`);
            inserted++;
        } catch (err: any) {
            console.error(`  ❌ ${userData.email} — ${err.message}`);
            errors++;
        }
    }

    console.log(`✅ users: ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
    console.log('\n🎉 Seeding complete!\n');
    console.log('📋 Demo Credentials:');
    console.log('─────────────────────────────────────────────');
    for (const u of demoUsers) {
        console.log(`  ${u.role.padEnd(20)} ${u.email.padEnd(30)} ${u.password}`);
    }
    console.log('─────────────────────────────────────────────');

    await mongoose.disconnect();
    process.exit(0);
}

runSeeds().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
