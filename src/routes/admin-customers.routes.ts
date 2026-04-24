import { Router, Request, Response } from 'express';

const router = Router();

// GET /admin/customers - List all customers (parents/students)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const status = req.query.status as string;
        const role = req.query.role as string;
        const skip = (page - 1) * limit;

        const filter: any = {
            role: { $in: ['PARENT', 'STUDENT', 'USER'] },
            isDeleted: { $ne: true }
        };
        if (status) filter.status = status;
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const [customers, total] = await Promise.all([
            User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: {
                customers,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
            message: 'Customers retrieved successfully',
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch customers' });
    }
});

// GET /admin/customers/statistics
router.get('/statistics', async (_req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [total, active, inactive, newThisMonth, byRole] = await Promise.all([
            User.countDocuments({ role: { $in: ['PARENT', 'STUDENT', 'USER'] }, isDeleted: { $ne: true } }),
            User.countDocuments({ role: { $in: ['PARENT', 'STUDENT', 'USER'] }, status: 'ACTIVE', isDeleted: { $ne: true } }),
            User.countDocuments({ role: { $in: ['PARENT', 'STUDENT', 'USER'] }, status: { $ne: 'ACTIVE' }, isDeleted: { $ne: true } }),
            User.countDocuments({ role: { $in: ['PARENT', 'STUDENT', 'USER'] }, createdAt: { $gte: monthStart }, isDeleted: { $ne: true } }),
            User.aggregate([
                { $match: { role: { $in: ['PARENT', 'STUDENT', 'USER'] }, isDeleted: { $ne: true } } },
                { $group: { _id: '$role', count: { $sum: 1 } } },
            ]),
        ]);

        res.json({
            success: true,
            data: { total, active, inactive, newThisMonth, byRole },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch statistics' });
    }
});

// GET /admin/customers/parents
router.get('/parents', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const skip = (page - 1) * limit;

        const filter: any = { role: 'PARENT', isDeleted: { $ne: true } };
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [parents, total] = await Promise.all([
            User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: { parents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch parents' });
    }
});

// GET /admin/customers/assessments
router.get('/assessments', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string;
        const skip = (page - 1) * limit;

        const filter: any = { type: 'ASSESSMENT', isDeleted: { $ne: true } };
        if (status) filter.status = status;

        const [assessments, total] = await Promise.all([
            Booking.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            Booking.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: { assessments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch assessments' });
    }
});

// GET /admin/customers/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');

        const customer = await User.findOne({
            _id: req.params.id,
            role: { $in: ['PARENT', 'STUDENT', 'USER'] },
            isDeleted: { $ne: true },
        }).select('-password').lean();

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const bookings = await Booking.find({
            $or: [{ userId: req.params.id }, { parentId: req.params.id }],
            isDeleted: { $ne: true },
        }).sort({ createdAt: -1 }).limit(20).lean();

        res.json({ success: true, data: { ...customer, recentBookings: bookings } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch customer' });
    }
});

// PUT /admin/customers/:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: { $in: ['PARENT', 'STUDENT', 'USER'] }, isDeleted: { $ne: true } },
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password').lean();

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, data: customer, message: 'Customer updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update customer' });
    }
});

// PATCH /admin/customers/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { status } = req.body;
        if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: { $in: ['PARENT', 'STUDENT', 'USER'] }, isDeleted: { $ne: true } },
            { $set: { status } },
            { new: true }
        ).select('-password').lean();

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, data: customer, message: `Customer status updated to ${status}` });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
    }
});

export default router;
