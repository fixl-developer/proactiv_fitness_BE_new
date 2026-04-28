import { Router, Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { Location } from './location.model';
import { LocationStatus } from '@shared/enums';

const router = Router();

router.get(
    '/locations',
    asyncHandler(async (_req: Request, res: Response) => {
        const docs = await Location.find({ status: LocationStatus.ACTIVE })
            .select('name code address contactInfo operatingHours facilities amenities images coverImage capacity status')
            .sort({ name: 1 })
            .lean();

        const data = docs.map((doc: any) => ({
            id: String(doc._id),
            name: doc.name,
            code: doc.code,
            slug: String(doc.code || doc.name || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, ''),
            address: doc.address || {},
            contactInfo: doc.contactInfo || {},
            operatingHours: doc.operatingHours || {},
            facilities: doc.facilities || [],
            amenities: doc.amenities || [],
            images: doc.images || [],
            coverImage: doc.coverImage || '',
            capacity: doc.capacity || 0,
            status: doc.status,
        }));

        res.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    })
);

export default router;
