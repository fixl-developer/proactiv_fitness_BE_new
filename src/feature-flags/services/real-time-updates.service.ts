import { Db } from 'mongodb';
import { EventEmitter } from 'events';
import { FlagDefinition, Environment } from '../interfaces';
import logger from '../../../shared/utils/logger.util';

export interface FlagUpdateEvent {
    type: 'flag_updated' | 'flag_created' | 'flag_deleted' | 'flag_enabled' | 'flag_disabled';
    flagKey: string;
    tenantId: string | null;
    environment: Environment;
    timestamp: Date;
    data?: any;
}

/**
 * Real-time Updates Service for Feature Flags
 */
export class RealTimeUpdatesService extends EventEmitter {
    private db: Db;
    private changeStream: any;
    private isActive: boolean = false;

    constructor(db: Db) {
        super();
        this.db = db;
    }

    /**
     * Start watching for flag changes
     */
    async start(): Promise<void> {
        if (this.isActive) {
            return;
        }

        try {
            const collection = this.db.collection('feature_flags');

            this.changeStream = collection.watch([
                {
                    $match: {
                        $or: [
                            { operationType: 'insert' },
                            { operationType: 'update' },
                            { operationType: 'delete' },
                            { operationType: 'replace' }
                        ]
                    }
                }
            ], {
                fullDocument: 'updateLookup'
            });

            this.changeStream.on('change', this.handleChange.bind(this));
            this.changeStream.on('error', this.handleError.bind(this));

            this.isActive = true;
            logger.info('Real-time updates service started');
        } catch (error) {
            logger.error('Failed to start real-time updates service:', error);
            throw error;
        }
    }

    /**
     * Stop watching for changes
     */
    async stop(): Promise<void> {
        if (!this.isActive) {
            return;
        }

        try {
            if (this.changeStream) {
                await this.changeStream.close();
                this.changeStream = null;
            }

            this.isActive = false;
            logger.info('Real-time updates service stopped');
        } catch (error) {
            logger.error('Failed to stop real-time updates service:', error);
        }
    }

    /**
     * Handle change stream events
     */
    private handleChange(change: any): void {
        try {
            const event = this.mapChangeToEvent(change);
            if (event) {
                this.emit('flagUpdate', event);
                logger.debug('Flag update event emitted:', event);
            }
        } catch (error) {
            logger.error('Error handling change event:', error);
        }
    }

    /**
     * Handle change stream errors
     */
    private handleError(error: any): void {
        logger.error('Change stream error:', error);
        this.emit('error', error);

        // Attempt to restart the change stream
        setTimeout(() => {
            if (this.isActive) {
                this.restart();
            }
        }, 5000);
    }

    /**
     * Restart the change stream
     */
    private async restart(): Promise<void> {
        try {
            await this.stop();
            await this.start();
            logger.info('Real-time updates service restarted');
        } catch (error) {
            logger.error('Failed to restart real-time updates service:', error);
        }
    }

    /**
     * Map MongoDB change event to flag update event
     */
    private mapChangeToEvent(change: any): FlagUpdateEvent | null {
        const { operationType, fullDocument, documentKey } = change;

        if (!fullDocument && operationType !== 'delete') {
            return null;
        }

        const baseEvent = {
            flagKey: fullDocument?.flagKey || documentKey?.flagKey,
            tenantId: fullDocument?.tenantId || null,
            environment: fullDocument?.environment,
            timestamp: new Date()
        };

        switch (operationType) {
            case 'insert':
                return {
                    ...baseEvent,
                    type: 'flag_created',
                    data: fullDocument
                };

            case 'update':
            case 'replace':
                // Determine if this was an enable/disable operation
                const updatedFields = change.updateDescription?.updatedFields || {};
                if ('isEnabled' in updatedFields) {
                    return {
                        ...baseEvent,
                        type: updatedFields.isEnabled ? 'flag_enabled' : 'flag_disabled',
                        data: { isEnabled: updatedFields.isEnabled }
                    };
                }

                return {
                    ...baseEvent,
                    type: 'flag_updated',
                    data: updatedFields
                };

            case 'delete':
                return {
                    ...baseEvent,
                    type: 'flag_deleted',
                    data: null
                };

            default:
                return null;
        }
    }

    /**
     * Subscribe to flag updates for specific criteria
     */
    subscribeToFlag(
        flagKey: string,
        tenantId: string | null,
        environment: Environment,
        callback: (event: FlagUpdateEvent) => void
    ): () => void {
        const listener = (event: FlagUpdateEvent) => {
            if (
                event.flagKey === flagKey &&
                event.tenantId === tenantId &&
                event.environment === environment
            ) {
                callback(event);
            }
        };

        this.on('flagUpdate', listener);

        // Return unsubscribe function
        return () => {
            this.off('flagUpdate', listener);
        };
    }

    /**
     * Subscribe to all flag updates for a tenant
     */
    subscribeToTenant(
        tenantId: string | null,
        environment: Environment,
        callback: (event: FlagUpdateEvent) => void
    ): () => void {
        const listener = (event: FlagUpdateEvent) => {
            if (
                event.tenantId === tenantId &&
                event.environment === environment
            ) {
                callback(event);
            }
        };

        this.on('flagUpdate', listener);

        // Return unsubscribe function
        return () => {
            this.off('flagUpdate', listener);
        };
    }

    /**
     * Get service status
     */
    getStatus(): {
        isActive: boolean;
        listeners: number;
    } {
        return {
            isActive: this.isActive,
            listeners: this.listenerCount('flagUpdate')
        };
    }
}