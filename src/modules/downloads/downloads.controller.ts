import { Request, Response } from 'express'
import downloadsService from './downloads.service'

export class DownloadsController {
    async getDownloads(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const downloads = await downloadsService.getDownloads(userId)
            res.json({ success: true, data: downloads })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async getDownloadById(req: Request, res: Response) {
        try {
            const { id } = req.params
            const download = await downloadsService.getDownloadById(id)
            if (!download) {
                return res.status(404).json({ success: false, error: 'Download not found' })
            }
            res.json({ success: true, data: download })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async downloadFile(req: Request, res: Response) {
        try {
            const { id } = req.params
            const download = await downloadsService.getDownloadById(id)
            if (!download) {
                return res.status(404).json({ success: false, error: 'Download not found' })
            }

            // Increment download count
            await downloadsService.incrementDownloadCount(id)

            // In a real implementation, stream the file from storage
            // For now, just return the download info
            res.json({ success: true, data: { message: 'Download started', url: download.url } })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async deleteDownload(req: Request, res: Response) {
        try {
            const { id } = req.params
            await downloadsService.deleteDownload(id)
            res.json({ success: true, data: { message: 'Download deleted' } })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async getCertificates(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const downloads = await downloadsService.getDownloadsByType(userId, 'certificate')
            res.json({ success: true, data: downloads })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async getReports(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const downloads = await downloadsService.getDownloadsByType(userId, 'report')
            res.json({ success: true, data: downloads })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async getMaterials(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const downloads = await downloadsService.getDownloadsByType(userId, 'material')
            res.json({ success: true, data: downloads })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async getDownloadStats(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const stats = await downloadsService.getDownloadStats(userId)
            res.json({ success: true, data: stats })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async shareDownload(req: Request, res: Response) {
        try {
            const { id } = req.params
            const download = await downloadsService.getDownloadById(id)
            if (!download) {
                return res.status(404).json({ success: false, error: 'Download not found' })
            }

            // In a real implementation, generate a shareable link
            res.json({ success: true, data: { shareUrl: `${process.env.APP_URL}/downloads/share/${id}` } })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }
}

export default new DownloadsController()
