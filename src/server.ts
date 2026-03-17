import app from './app';
import envConfig from '@config/env.config';
import databaseConfig from '@config/database.config';
import logger from '@shared/utils/logger.util';
import { User } from './modules/iam/user.model';
import { demoUsers } from './data-architecture/seeds/user.seeds';

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

        // Auto-seed demo users if they don't exist
        try {
            let seeded = 0;
            for (const userData of demoUsers) {
                const exists = await User.findOne({ email: userData.email });
                if (!exists) {
                    await User.create(userData);
                    seeded++;
                    logger.info(`Demo user seeded: ${userData.email} (${userData.role})`);
                }
            }
            if (seeded > 0) {
                logger.info(`${seeded} demo user(s) seeded successfully`);
            }
        } catch (seedError) {
            logger.warn('Demo user seeding skipped:', seedError);
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
