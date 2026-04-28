#!/usr/bin/env node

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { SupportDataSeeder } from '../modules/support/support.seeder';

// Load environment variables
config();

async function seedSupportData() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB successfully!');

        // Check command line arguments
        const args = process.argv.slice(2);
        const shouldClear = args.includes('--clear') || args.includes('-c');
        const shouldSeed = args.includes('--seed') || args.includes('-s') || args.length === 0;

        if (shouldClear) {
            await SupportDataSeeder.clearAll();
        }

        if (shouldSeed) {
            await SupportDataSeeder.seedAll();
        }

        console.log('🎉 Support data seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding support data:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Run the seeder
seedSupportData();