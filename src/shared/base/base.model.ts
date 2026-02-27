import { Schema } from 'mongoose';

// Base schema fields that all models will inherit
export const baseSchemaFields = {
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
};

// Base schema options
export const baseSchemaOptions = {
    timestamps: true, // Adds createdAt and updatedAt
    versionKey: false, // Removes __v
    toJSON: {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.isDeleted;
            delete ret.deletedAt;
            delete ret.deletedBy;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
    },
};

// Query helper to exclude soft-deleted documents
export const excludeDeleted = function (this: any) {
    return this.where({ isDeleted: false });
};
