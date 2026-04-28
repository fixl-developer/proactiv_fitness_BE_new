import { Router, Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/async-handler.util';
import { Location } from './location.model';
import { LocationStatus } from '@shared/enums';

const router = Router();

router.get(
    '/locations',
    asyncHandler(async (_req: Request, res: Response) => {
        // Show every location that isn't explicitly INACTIVE or soft-deleted.
        // Legacy seed data and locations created before the status enum existed
        // have either no `status` field or a non-canonical value — strict
        // `status === 'ACTIVE'` filtering hid them from the marketing site even
        // though the admin Locations table showed them as Active.
        const docs = await Location.find({
            status: { $ne: LocationStatus.INACTIVE },
            isDeleted: { $ne: true },
        })
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
