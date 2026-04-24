import { DownloadModel, IDownload } from './downloads.model'

export class DownloadsService {
    async getDownloads(userId: string): Promise<IDownload[]> {
        try {
            const downloads = await DownloadModel.find({ userId }).sort({ createdAt: -1 })
            return downloads
        } catch (error) {
            console.error('Error fetching downloads:', error)
            throw error
        }
    }

    async getDownloadById(id: string): Promise<IDownload | null> {
        try {
            const download = await DownloadModel.findById(id)
            return download
        } catch (error) {
            console.error('Error fetching download:', error)
            throw error
        }
    }

    async createDownload(userId: string, data: any): Promise<IDownload> {
        try {
            const download = await DownloadModel.create({
                userId,
                ...data
            })
            return download
        } catch (error) {
            console.error('Error creating download:', error)
            throw error
        }
    }

    async updateDownload(id: string, data: Partial<IDownload>): Promise<IDownload | null> {
        try {
            const download = await DownloadModel.findByIdAndUpdate(id, data, { new: true })
            return download
        } catch (error) {
            console.error('Error updating download:', error)
            throw error
        }
    }

    async deleteDownload(id: string): Promise<void> {
        try {
            await DownloadModel.findByIdAndDelete(id)
        } catch (error) {
            console.error('Error deleting download:', error)
            throw error
        }
    }

    async incrementDownloadCount(id: string): Promise<IDownload | null> {
        try {
            const download = await DownloadModel.findByIdAndUpdate(
                id,
                { $inc: { downloadCount: 1 } },
                { new: true }
            )
            return download
        } catch (error) {
            console.error('Error incrementing download count:', error)
            throw error
        }
    }

    async getDownloadsByType(userId: string, type: string): Promise<IDownload[]> {
        try {
            const downloads = await DownloadModel.find({ userId, type }).sort({ createdAt: -1 })
            return downloads
        } catch (error) {
            console.error('Error fetching downloads by type:', error)
            throw error
        }
    }

    async getDownloadStats(userId: string): Promise<any> {
        try {
            const total = await DownloadModel.countDocuments({ userId })
            const byType = await DownloadModel.aggregate([
                { $match: { userId } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ])
            const totalDownloads = await DownloadModel.aggregate([
                { $match: { userId } },
                { $group: { _id: null, total: { $sum: '$downloadCount' } } }
            ])

            return {
                total,
                byType: Object.fromEntries(byType.map(b => [b._id, b.count])),
                totalDownloads: totalDownloads[0]?.total || 0
            }
        } catch (error) {
            console.error('Error fetching download stats:', error)
            throw error
        }
    }
}

export default new DownloadsService()
