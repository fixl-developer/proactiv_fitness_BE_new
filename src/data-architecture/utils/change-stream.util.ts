import { Db, ChangeStream, ChangeStreamDocument } from 'mongodb';
import logger from '../../shared/utils/logger.util';

export interface ChangeStreamProcessor<T = any> {
    collectionName: string;
    process: (change: ChangeStreamDocument<T>) => Promise<void>;
    onError?: (error: Error) => void;
    onClose?: () => void;
}

/**
 * Change Stream Manager for real-time data processing
 */
export class ChangeStreamManager {
    private db: Db;
    private streams: Map<string, ChangeStream> = new Map();
    private processors: Map<string, ChangeStreamProcessor> = new Map();

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Register a change stream processor
     */
    registerProcessor(id: string, processor: ChangeStreamProcessor): void {
        this.processors.set(id, processor);
        logger.info(`Registered change stream processor: ${id} for collection: ${processor.collectionName}`);
    }

    /**
     * Start a change stream
     */
    async startStream(processorId: string): Promise<void> {
        const processor = this.processors.get(processorId);
        if (!processor) {
            throw new Error(`Processor not found: ${processorId}`);
        }

        if (this.streams.has(processorId)) {
            logger.warn(`Change stream already running for processor: ${processorId}`);
            return;
        }

        try {
            const collection = this.db.collection(processor.collectionName);
            const changeStream = collection.watch([], {
                fullDocument: 'updateLookup',
                resumeAfter: undefined, // Could be persisted for resumability
            });

            this.streams.set(processorId, changeStream);

            changeStream.on('change', async (change) => {
                try {
                    await processor.process(change);
                } catch (error) {
                    logger.error(`Error processing change in ${processorId}:`, error);
                    if (processor.onError) {
                        processor.onError(error as Error);
                    }
                }
            });

            changeStream.on('error', (error) => {
                logger.error(`Change stream error for ${processorId}:`, error);
                if (processor.onError) {
                    processor.onError(error);
                }
                // Attempt to restart the stream
                this.restartStream(processorId);
            });

            changeStream.on('close', () => {
                logger.info(`Change stream closed for ${processorId}`);
                this.streams.delete(processorId);
                if (processor.onClose) {
                    processor.onClose();
                }
            });

            logger.info(`Started change stream for processor: ${processorId}`);
        } catch (error) {
            logger.error(`Failed to start change stream for ${processorId}:`, error);
            throw error;
        }
    }

    /**
     * Stop a change stream
     */
    async stopStream(processorId: string): Promise<void> {
        const stream = this.streams.get(processorId);
        if (stream) {
            await stream.close();
            this.streams.delete(processorId);
            logger.info(`Stopped change stream for processor: ${processorId}`);
        }
    }

    /**
     * Restart a change stream
     */
    private async restartStream(processorId: string): Promise<void> {
        logger.info(`Restarting change stream for processor: ${processorId}`);

        try {
            await this.stopStream(processorId);
            // Wait a bit before restarting
            await new Promise(resolve => setTimeout(resolve, 5000));
            await this.startStream(processorId);
        } catch (error) {
            logger.error(`Failed to restart change stream for ${processorId}:`, error);
        }
    }

    /**
     * Start all registered processors
     */
    async startAllStreams(): Promise<void> {
        const processorIds = Array.from(this.processors.keys());
        logger.info(`Starting ${processorIds.length} change streams`);

        for (const processorId of processorIds) {
            try {
                await this.startStream(processorId);
            } catch (error) {
                logger.error(`Failed to start stream for ${processorId}:`, error);
            }
        }
    }

    /**
     * Stop all change streams
     */
    async stopAllStreams(): Promise<void> {
        const streamIds = Array.from(this.streams.keys());
        logger.info(`Stopping ${streamIds.length} change streams`);

        for (const streamId of streamIds) {
            try {
                await this.stopStream(streamId);
            } catch (error) {
                logger.error(`Failed to stop stream for ${streamId}:`, error);
            }
        }
    }

    /**
     * Get status of all streams
     */
    getStreamStatus(): { [processorId: string]: boolean } {
        const status: { [processorId: string]: boolean } = {};

        for (const processorId of this.processors.keys()) {
            status[processorId] = this.streams.has(processorId);
        }

        return status;
    }
}

/**
 * Location Daily Stats Processor
 */
export class LocationDailyStatsProcessor implements ChangeStreamProcessor {
    collectionName = 'bookings';
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async process(change: ChangeStreamDocument): Promise<void> {
        if (change.operationType === 'insert' || change.operationType === 'update') {
            const booking = change.fullDocument;
            if (!booking) return;

            await this.updateLocationStats(booking);
        }
    }

    private async updateLocationStats(booking: any): Promise<void> {
        const date = new Date(booking.sessionDate);
        date.setHours(0, 0, 0, 0); // Start of day

        const statsCollection = this.db.collection('location_daily_stats');

        const filter = {
            locationId: booking.locationId,
            date: date,
        };

        const update = {
            $inc: {
                totalBookings: 1,
                [`${booking.status}Bookings`]: 1,
            },
            $setOnInsert: {
                tenantId: booking.tenantId,
                countryId: booking.countryId,
                regionId: booking.regionId,
                businessUnitId: booking.businessUnitId,
                locationId: booking.locationId,
                date: date,
            },
            $set: {
                lastUpdated: new Date(),
            },
        };

        await statsCollection.updateOne(filter, update, { upsert: true });
        logger.debug(`Updated location daily stats for ${booking.locationId} on ${date.toISOString()}`);
    }

    onError(error: Error): void {
        logger.error('LocationDailyStatsProcessor error:', error);
    }
}

/**
 * User Activity Summary Processor
 */
export class UserActivitySummaryProcessor implements ChangeStreamProcessor {
    collectionName = 'bookings';
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async process(change: ChangeStreamDocument): Promise<void> {
        if (change.operationType === 'insert' || change.operationType === 'update') {
            const booking = change.fullDocument;
            if (!booking) return;

            await this.updateUserActivitySummary(booking);
        }
    }

    private async updateUserActivitySummary(booking: any): Promise<void> {
        const month = new Date(booking.sessionDate);
        month.setDate(1);
        month.setHours(0, 0, 0, 0); // Start of month

        const summaryCollection = this.db.collection('user_activity_summary');

        const filter = {
            userId: booking.userId,
            month: month,
        };

        const update = {
            $inc: {
                totalBookings: 1,
                totalSpent: booking.amount || 0,
            },
            $setOnInsert: {
                userId: booking.userId,
                month: month,
                attendanceRate: 0,
                favoritePrograms: [],
            },
            $set: {
                lastUpdated: new Date(),
            },
        };

        await summaryCollection.updateOne(filter, update, { upsert: true });
        logger.debug(`Updated user activity summary for ${booking.userId} for ${month.toISOString()}`);
    }

    onError(error: Error): void {
        logger.error('UserActivitySummaryProcessor error:', error);
    }
}