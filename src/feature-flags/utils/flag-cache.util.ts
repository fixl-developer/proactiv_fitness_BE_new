/**
 * Feature Flag Cache Utility
 * 
 * LRU cache implementation for feature flag evaluations with TTL support
 * and pattern-based invalidation.
 */

import { FlagEvaluation } from '../interfaces';
import { Logger } from '../../shared/utils/logger.util';

interface CachedFlag extends FlagEvaluation {
    cachedAt: number;
    ttl: number;
}

export class FlagCacheUtil {
    private cache = new Map<string, CachedFlag>();
    private maxSize = 10000;
    private defaultTtl = 60000; // 60 seconds
    private logger = Logger.getInstance();

    constructor(maxSize = 10000, defaultTtl = 60000) {
        this.maxSize = maxSize;
        this.defaultTtl = defaultTtl;
    }

    /**
     * Get cached flag evaluation
     */
    get(key: string): FlagEvaluation | undefined {
        const cached = this.cache.get(key);

        if (!cached) {
            return undefined;
        }

        // Check if expired
        const now = Date.now();
        if (now - cached.cachedAt > cached.ttl) {
            this.cache.delete(key);
            return undefined;
        }

        // Move to end (LRU)
        this.cache.delete(key);
        this.cache.set(key, cached);

        // Return evaluation without cache metadata
        const { cachedAt, ttl, ...evaluation } = cached;
        return evaluation;
    }

    /**
     * Set cached flag evaluation
     */
    set(key: string, evaluation: FlagEvaluation, ttl = this.defaultTtl): void {
        // Evict oldest entries if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        const cached: CachedFlag = {
            ...evaluation,
            cachedAt: Date.now(),
            ttl
        };

        this.cache.set(key, cached);
    }

    /**
     * Invalidate cache entries for a specific flag
     */
    invalidate(flagKey: string): void {
        const pattern = new RegExp(`^${flagKey}:`);
        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
        });

        if (keysToDelete.length > 0) {
            this.logger.debug(`Invalidated ${keysToDelete.length} cache entries for flag: ${flagKey}`);
        }
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        this.logger.debug('Flag cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        expiredEntries: number;
    } {
        const now = Date.now();
        let expiredEntries = 0;

        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.cachedAt > cached.ttl) {
                expiredEntries++;
            }
        }

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: 0, // Would need to track hits/misses for accurate calculation
            expiredEntries
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.cachedAt > cached.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
        });

        if (keysToDelete.length > 0) {
            this.logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }

    /**
     * Start periodic cleanup
     */
    startPeriodicCleanup(intervalMs = 300000): void { // 5 minutes
        setInterval(() => {
            this.cleanup();
        }, intervalMs);
    }
}