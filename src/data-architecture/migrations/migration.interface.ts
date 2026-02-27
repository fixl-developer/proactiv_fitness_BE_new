import { Db } from 'mongodb';

export interface Migration {
    version: number;
    name: string;
    up: (db: Db) => Promise<void>;
    down: (db: Db) => Promise<void>;
}

export interface MigrationRecord {
    _id?: any;
    version: number;
    name: string;
    appliedAt: Date;
    executionTime: number;
}
