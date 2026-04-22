import mongoose, { Schema, Document } from 'mongoose'

export interface IDownload extends Document {
    userId: string
    name: string
    type: 'certificate' | 'report' | 'material' | 'document'
    category: string
    size: string
    downloadCount: number
    url: string
    description?: string
    createdAt: Date
    updatedAt: Date
}

const downloadSchema = new Schema<IDownload>(
    {
        userId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        type: { type: String, enum: ['certificate', 'report', 'material', 'document'], required: true },
        category: { type: String, required: true },
        size: { type: String, required: true },
        downloadCount: { type: Number, default: 0 },
        url: { type: String, required: true },
        description: { type: String }
    },
    { timestamps: true }
)

export const DownloadModel = mongoose.model<IDownload>('Download', downloadSchema)
