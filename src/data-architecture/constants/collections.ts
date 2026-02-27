/**
 * Collection Names
 * Centralized collection name constants for the entire application
 */

// Core Collections
export const COLLECTIONS = {
    // User Management
    USERS: 'users',

    // BCMS Collections
    COUNTRIES: 'countries',
    REGIONS: 'regions',
    BUSINESS_UNITS: 'business_units',
    LOCATIONS: 'locations',
    ROOMS: 'rooms',
    TERMS: 'terms',
    HOLIDAY_CALENDARS: 'holiday_calendars',

    // Program Management
    PROGRAMS: 'programs',
    SESSIONS: 'sessions',

    // Booking Management
    BOOKINGS: 'bookings',

    // Append-Only Collections
    AUDIT_LOGS: 'audit_logs',
    LEDGER_ENTRIES: 'ledger_entries',

    // Projection Collections
    LOCATION_DAILY_STATS: 'location_daily_stats',
    USER_ACTIVITY_SUMMARY: 'user_activity_summary',

    // System Collections
    MIGRATIONS: '_migrations',
} as const;

/**
 * Collection Categories
 */
export enum CollectionCategory {
    GLOBAL = 'global',
    MULTI_TENANT = 'multi_tenant',
    APPEND_ONLY = 'append_only',
    PROJECTION = 'projection',
}

/**
 * Collection Metadata
 */
export const COLLECTION_METADATA: Record<string, {
    category: CollectionCategory;
    tenantScoped: boolean;
    appendOnly: boolean;
    isProjection: boolean;
}> = {
    [COLLECTIONS.USERS]: {
        category: CollectionCategory.MULTI_TENANT,
        tenantScoped: true,
        appendOnly: false,
        isProjection: false,
    },
    [COLLECTIONS.COUNTRIES]: {
        category: CollectionCategory.GLOBAL,
        tenantScoped: false,
        appendOnly: false,
        isProjection: false,
    },
    [COLLECTIONS.REGIONS]: {
        category: CollectionCategory.MULTI_TENANT,
        tenantScoped: true,
        appendOnly: false,
        isProjection: false,
    },
    [COLLECTIONS.BUSINESS_UNITS]: {
        category: CollectionCategory.MULTI_TENANT,
        tenantScoped: true,
        appendOnly: false,
        isProjection: false,
    },
    [COLLECTIONS.LOCATIONS]: {
        category: CollectionCategory.MULTI_TENANT,
        tenantScoped: true,
        appendOnly: false,
        isProjection: false,
    },
    [COLLECTIONS.PROGRAMS]: {
        category: CollectionCategory.MULTI_TENANT,
        tenantScoped: true,
        appendOnly: false,
        isProjection: false,
    },
    [COLLECTIONS.BOOKINGS]: {
        category: CollectionCategory.MULTI_TENANT,
        tenantScoped: true,
        appendOnly: false,
        isProjection: false,
    },
    [COLLECTIONS.AUDIT_LOGS]: {
        category: CollectionCategory.APPEND_ONLY,
        tenantScoped: true,
        appendOnly: true,
        isProjection: false,
    },
    [COLLECTIONS.LEDGER_ENTRIES]: {
        category: CollectionCategory.APPEND_ONLY,
        tenantScoped: true,
        appendOnly: true,
        isProjection: false,
    },
    [COLLECTIONS.LOCATION_DAILY_STATS]: {
        category: CollectionCategory.PROJECTION,
        tenantScoped: true,
        appendOnly: false,
        isProjection: true,
    },
    [COLLECTIONS.USER_ACTIVITY_SUMMARY]: {
        category: CollectionCategory.PROJECTION,
        tenantScoped: true,
        appendOnly: false,
        isProjection: true,
    },
};
