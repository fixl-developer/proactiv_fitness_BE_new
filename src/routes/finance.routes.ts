import { Router, Request, Response } from 'express';
import { Schema, model, models, Document } from 'mongoose';
import { authenticate } from '../modules/iam/auth.middleware';
import { FinancialLedgerModel } from '../modules/financial-ledger/financial-ledger.model';

// =============================================
// Revenue model (lightweight, scoped to admin Finance > Revenue Reports page)
// =============================================
interface IRevenueRecord extends Document {
    tenantId: string;
    date: Date;
    source: string;
    amount: number;
    currency: string;
    locationId?: string;
    category: 'recurring' | 'one-time';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const revenueRecordSchema = new Schema<IRevenueRecord>(
    {
        tenantId: { type: String, required: true, default: 'default' },
        date: { type: Date, required: true },
        source: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        locationId: { type: String },
        category: { type: String, enum: ['recurring', 'one-time'], default: 'recurring' },
        notes: { type: String },
    },
    { timestamps: true }
);

// Avoid OverwriteModelError on hot-reload
const RevenueRecordModel: any = (models as any).RevenueRecord || model<IRevenueRecord>('RevenueRecord', revenueRecordSchema);

const router = Router();

// =============================================
// Helpers
// =============================================
function paginate(req: Request) {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    return { page, limit, skip: (page - 1) * limit };
}

// =============================================
// REVENUE
// GET    /finance/revenue
// GET    /finance/revenue/:id
// POST   /finance/revenue
// PUT    /finance/revenue/:id
// DELETE /finance/revenue/:id
// =============================================

router.get('/revenue', authenticate, async (req: Request, res: Response) => {
    try {
        const { page, limit, skip } = paginate(req);
        const search = ((req.query.search as string) || '').trim();
        const startDate = (req.query.startDate as string) || '';
        const endDate = (req.query.endDate as string) || '';
        const source = (req.query.source as string) || '';

        const filter: any = {};
        if (search) {
            filter.$or = [
                { source: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } },
                { locationId: { $regex: search, $options: 'i' } },
            ];
        }
        if (source) filter.source = source;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const [docs, total] = await Promise.all([
            RevenueRecordModel.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
            RevenueRecordModel.countDocuments(filter),
        ]);

        const data = docs.map((d: any) => ({
            id: String(d._id),
            date: d.date,
            source: d.source,
            amount: d.amount,
            currency: d.currency,
            locationId: d.locationId,
            category: d.category,
            notes: d.notes,
            createdAt: d.createdAt,
        }));

        res.json({
            success: true,
            data,
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/revenue/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const doc = await RevenueRecordModel.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Revenue record not found' });
        return res.json({ success: true, data: { id: String((doc as any)._id), ...doc } });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/revenue', authenticate, async (req: Request, res: Response) => {
    try {
        const { date, source, amount, currency, locationId, category, notes } = req.body;
        if (!date || !source || amount === undefined) {
            return res.status(400).json({ success: false, error: 'date, source, and amount are required' });
        }
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
        }
        const doc = await RevenueRecordModel.create({
            tenantId: req.user?.tenantId || 'default',
            date: new Date(date),
            source,
            amount,
            currency: currency || 'USD',
            locationId,
            category: category || 'recurring',
            notes,
        });
        return res.json({
            success: true,
            data: {
                id: String(doc._id),
                date: doc.date,
                source: doc.source,
                amount: doc.amount,
                currency: doc.currency,
                locationId: doc.locationId,
                category: doc.category,
                notes: doc.notes,
                createdAt: doc.createdAt,
            },
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.put('/revenue/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const updates: any = {};
        const allowed = ['source', 'amount', 'currency', 'locationId', 'category', 'notes'];
        for (const k of allowed) {
            if (req.body[k] !== undefined) updates[k] = req.body[k];
        }
        if (req.body.date !== undefined) updates.date = new Date(req.body.date);
        if (updates.amount !== undefined && parseFloat(updates.amount) <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
        }

        const doc = await RevenueRecordModel.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Revenue record not found' });
        return res.json({
            success: true,
            data: {
                id: String((doc as any)._id),
                date: (doc as any).date,
                source: (doc as any).source,
                amount: (doc as any).amount,
                currency: (doc as any).currency,
                locationId: (doc as any).locationId,
                category: (doc as any).category,
                notes: (doc as any).notes,
                createdAt: (doc as any).createdAt,
            },
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/revenue/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const doc = await RevenueRecordModel.findByIdAndDelete(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Revenue record not found' });
        return res.json({ success: true, data: { id: String((doc as any)._id) } });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

// =============================================
// LEDGER (full CRUD on FinancialLedger model)
// Maps frontend fields:
//   account     -> stored as `category`
//   description -> stored as `description`
//   reference   -> stored in metadata.reference
//   status      -> stored in metadata.status
// =============================================

function mapLedgerDoc(d: any) {
    return {
        id: String(d._id),
        date: d.createdAt,
        type: d.type,
        account: d.category,
        amount: d.amount,
        currency: d.currency,
        description: d.description,
        reference: d.metadata?.reference || '',
        status: d.metadata?.status || 'pending',
        createdAt: d.createdAt,
    };
}

router.get('/ledger', authenticate, async (req: Request, res: Response) => {
    try {
        const { page, limit, skip } = paginate(req);
        const search = ((req.query.search as string) || '').trim();

        const filter: any = {};
        if (search) {
            filter.$or = [
                { description: { $regex: search, $options: 'i' } },
                { 'metadata.reference': { $regex: search, $options: 'i' } },
                { transactionId: { $regex: search, $options: 'i' } },
            ];
        }

        const [docs, total] = await Promise.all([
            FinancialLedgerModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            FinancialLedgerModel.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: docs.map(mapLedgerDoc),
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/ledger/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const doc = await FinancialLedgerModel.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Ledger entry not found' });
        return res.json({ success: true, data: mapLedgerDoc(doc) });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/ledger', authenticate, async (req: Request, res: Response) => {
    try {
        const { date, type, account, amount, currency, description, reference, status } = req.body;
        if (!date || !type || !account || amount === undefined || !description) {
            return res.status(400).json({ success: false, error: 'date, type, account, amount, description are required' });
        }
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
        }
        if (description.length < 10) {
            return res.status(400).json({ success: false, error: 'Description must be at least 10 characters' });
        }

        const doc = await FinancialLedgerModel.create({
            entryId: `LEDG-${Date.now().toString(36).toUpperCase()}`,
            tenantId: req.user?.tenantId || 'default',
            transactionId: reference || `TR-${Date.now()}`,
            type,
            amount,
            currency: currency || 'USD',
            category: account,
            description,
            relatedEntity: { entityType: '', entityId: '' },
            metadata: { reference: reference || '', status: status || 'pending', date },
        });
        return res.json({ success: true, data: mapLedgerDoc(doc.toObject()) });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.put('/ledger/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const existing = await FinancialLedgerModel.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, error: 'Ledger entry not found' });

        const updates: any = {};
        if (req.body.type !== undefined) updates.type = req.body.type;
        if (req.body.account !== undefined) updates.category = req.body.account;
        if (req.body.amount !== undefined) {
            if (parseFloat(req.body.amount) <= 0) {
                return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
            }
            updates.amount = req.body.amount;
        }
        if (req.body.currency !== undefined) updates.currency = req.body.currency;
        if (req.body.description !== undefined) {
            if (req.body.description.length < 10) {
                return res.status(400).json({ success: false, error: 'Description must be at least 10 characters' });
            }
            updates.description = req.body.description;
        }

        const newMeta: any = { ...(existing.metadata || {}) };
        if (req.body.reference !== undefined) newMeta.reference = req.body.reference;
        if (req.body.status !== undefined) newMeta.status = req.body.status;
        if (req.body.date !== undefined) newMeta.date = req.body.date;
        updates.metadata = newMeta;
        if (req.body.reference !== undefined) updates.transactionId = req.body.reference || existing.transactionId;

        const doc = await FinancialLedgerModel.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
        return res.json({ success: true, data: mapLedgerDoc(doc) });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/ledger/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const doc = await FinancialLedgerModel.findByIdAndDelete(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Ledger entry not found' });
        return res.json({ success: true, data: { id: String((doc as any)._id) } });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
