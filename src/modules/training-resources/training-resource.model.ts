import { Schema, model, Document, Model, Types } from 'mongoose';

export type ResourceType = 'document' | 'video' | 'article' | 'course' | 'link' | 'pdf';
export type ResourceCategory =
    | 'customer-service'
    | 'product-knowledge'
    | 'tools-systems'
    | 'soft-skills'
    | 'compliance'
    | 'onboarding'
    | 'other';

export interface ITrainingResource extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    url: string;
    type: ResourceType;
    category: ResourceCategory;
    tags: string[];
    estimatedMinutes: number;
    featured: boolean;
    isActive: boolean;
    addedBy: Types.ObjectId;
    addedByName: string;
    viewCount: number;
    lastOpenedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITrainingResourceView extends Document {
    _id: Types.ObjectId;
    resourceId: Types.ObjectId;
    userId: Types.ObjectId;
    openedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const TrainingResourceSchema = new Schema<ITrainingResource>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        url: {
            type: String,
            required: [true, 'URL is required'],
            trim: true,
            validate: {
                validator: (v: string) => URL_REGEX.test(v),
                message: 'URL must start with http:// or https://',
            },
        },
        type: {
            type: String,
            enum: ['document', 'video', 'article', 'course', 'link', 'pdf'],
            default: 'link',
            index: true,
        },
        category: {
            type: String,
            enum: [
                'customer-service',
                'product-knowledge',
                'tools-systems',
                'soft-skills',
                'compliance',
                'onboarding',
                'other',
            ],
            default: 'other',
            index: true,
        },
        tags: {
            type: [String],
            default: [],
            set: (arr: string[]) =>
                Array.from(new Set((arr || []).map((t) => t.trim()).filter(Boolean))),
        },
        estimatedMinutes: {
            type: Number,
            default: 0,
            min: 0,
            max: 100000,
        },
        featured: { type: Boolean, default: false, index: true },
        isActive: { type: Boolean, default: true, index: true },
        addedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        addedByName: { type: String, default: '' },
        viewCount: { type: Number, default: 0, min: 0 },
        lastOpenedAt: { type: Date },
    },
    { timestamps: true }
);

TrainingResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
TrainingResourceSchema.index({ category: 1, isActive: 1, featured: -1, createdAt: -1 });

const TrainingResourceViewSchema = new Schema<ITrainingResourceView>(
    {
        resourceId: {
            type: Schema.Types.ObjectId,
            ref: 'TrainingResource',
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        openedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

TrainingResourceViewSchema.index({ resourceId: 1, userId: 1, openedAt: -1 });

export const TrainingResource: Model<ITrainingResource> = model<ITrainingResource>(
    'TrainingResource',
    TrainingResourceSchema
);

export const TrainingResourceView: Model<ITrainingResourceView> = model<ITrainingResourceView>(
    'TrainingResourceView',
    TrainingResourceViewSchema
);
