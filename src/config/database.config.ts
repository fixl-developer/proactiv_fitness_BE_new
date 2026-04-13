import mongoose from 'mongoose';
import logger from '@shared/utils/logger.util';

export class DatabaseConfig {
    private static instance: DatabaseConfig;
    private isConnected: boolean = false;

    private constructor() { }

    static getInstance(): DatabaseConfig {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfig();
        }
        return DatabaseConfig.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info('Database already connected');
            return;
        }

        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness';

            await mongoose.connect(mongoUri, {
                maxPoolSize: 10,
                minPoolSize: 5,
                socketTimeoutMS: 45000,
                serverSelectionTimeoutMS: 30000,
                connectTimeoutMS: 30000,
                family: 4,
            });

            this.isConnected = true;
            logger.info('✅ MongoDB connected successfully');

            // Handle connection events
            mongoose.connection.on('error', (error) => {
                logger.error('MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
                this.isConnected = true;
            });
        } catch (error) {
            logger.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info('MongoDB disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

export default DatabaseConfig.getInstance();
