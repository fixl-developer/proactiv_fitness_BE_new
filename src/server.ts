import app from './app';
import envConfig from '@config/env.config';
import databaseConfig from '@config/database.config';
import logger from '@shared/utils/logger.util';
import { User } from './modules/iam/user.model';
import { demoUsers } from './data-architecture/seeds/user.seeds';
import { seedPartnerData } from './modules/partner-portal/partner-seed';

const PORT = envConfig.get().port;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
    process.exit(1);
});

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await databaseConfig.connect();

        // Auto-seed demo users + fix legacy roles (SUPER_ADMIN/HQ_ADMIN → ADMIN)
        try {
            // Fix any legacy SUPER_ADMIN or HQ_ADMIN roles in the database
            const legacyFix = await User.updateMany(
                { role: { $in: ['SUPER_ADMIN', 'HQ_ADMIN'] } },
                { $set: { role: 'ADMIN' } }
            );
            if (legacyFix.modifiedCount > 0) {
                logger.info(`Fixed ${legacyFix.modifiedCount} legacy role(s) → ADMIN`);
            }

            let seeded = 0;
            for (const userData of demoUsers) {
                try {
                    const exists = await User.findOne({ email: userData.email });
                    if (!exists) {
                        await User.create(userData);
                        seeded++;
                        logger.info(`Demo user seeded: ${userData.email} (${userData.role})`);
                    } else {
                        // Update role/status/emailVerified if changed in seed data
                        const updates: any = {};
                        if (exists.role !== userData.role) updates.role = userData.role;
                        if (exists.status !== userData.status) updates.status = userData.status;
                        if (!exists.isEmailVerified && userData.isEmailVerified) updates.isEmailVerified = true;
                        if (Object.keys(updates).length > 0) {
                            await User.updateOne({ _id: exists._id }, { $set: updates });
                            logger.info(`Demo user updated: ${userData.email} (${Object.keys(updates).join(', ')})`);
                        }
                    }
                } catch (userSeedError: any) {
                    logger.warn(`Failed to seed ${userData.email}: ${userSeedError.message}`);
                }
            }
            if (seeded > 0) {
                logger.info(`${seeded} demo user(s) seeded successfully`);
            }
        } catch (seedError) {
            logger.warn('Demo user seeding skipped:', seedError);
        }

        // Auto-seed partner portal data
        try {
            await seedPartnerData('partner-1');
        } catch (partnerSeedError) {
            logger.warn('Partner data seeding skipped:', partnerSeedError);
        }

        // Start Express server
        const server = app.listen(PORT, () => {
            logger.info(`
        ╔═══════════════════════════════════════════════════════╗
        ║                                                       ║
        ║   🚀 Proactiv Fitness Platform API                   ║
        ║                                                       ║
        ║   Environment: ${envConfig.get().nodeEnv.padEnd(37)}║
        ║   Port: ${PORT.toString().padEnd(44)}║
        ║   API Version: ${envConfig.get().apiVersion.padEnd(38)}║
        ║                                                       ║
        ║   Server is running at:                              ║
        ║   http://localhost:${PORT}                              ║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝
      `);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (error: any) => {
            // Don't crash on operational errors (e.g. 4xx responses)
            if (error?.isOperational) {
                logger.warn('Unhandled operational rejection:', error?.message);
                return;
            }
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...', error);
            server.close(() => {
                process.exit(1);
            });
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('👋 SIGTERM received. Shutting down gracefully...');
            server.close(async () => {
                await databaseConfig.disconnect();
                logger.info('Process terminated!');
            });
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
