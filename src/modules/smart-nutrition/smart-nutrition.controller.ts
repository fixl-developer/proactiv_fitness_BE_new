import { Router, Request, Response } from 'express';
import { SmartNutritionService } from './smart-nutrition.service';
import { SmartNutritionModel } from './smart-nutrition.model';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const service = new SmartNutritionService();

// ─── Meal Plans ────────────────────────────────────────────────

// Generate AI meal plan
router.post('/meal-plans', authenticate, async (req: Request, res: Response) => {
    try {
        const plan = await service.generateMealPlan({
            ...req.body,
            parentId: req.user?.id,
            tenantId: req.user?.tenantId,
        });
        res.json({ success: true, data: plan });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get meal plans for a child
router.get('/meal-plans/:childId', authenticate, async (req: Request, res: Response) => {
    try {
        const plans = await service.getMealPlans(req.params.childId);
        res.json({ success: true, data: plans });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single meal plan by ID
router.get('/meal-plans/plan/:planId', authenticate, async (req: Request, res: Response) => {
    try {
        const plan = await SmartNutritionModel.findById(req.params.planId).lean();
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Meal plan not found' });
        }
        res.json({ success: true, data: plan });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update meal plan status
router.put('/meal-plans/:planId/status', authenticate, async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const plan = await SmartNutritionModel.findByIdAndUpdate(
            req.params.planId,
            { status, updatedAt: new Date() },
            { new: true }
        );
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Meal plan not found' });
        }
        res.json({ success: true, data: plan });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Nutrition Tracking / Logging ──────────────────────────────

// Log a meal
router.post('/logs', authenticate, async (req: Request, res: Response) => {
    try {
        const log = await SmartNutritionModel.create({
            type: 'log',
            childId: req.body.childId || req.body.studentId,
            parentId: req.user?.id,
            tenantId: req.user?.tenantId,
            date: req.body.date || new Date(),
            mealType: req.body.mealType,
            foodItems: req.body.foodItems || [],
            calories: req.body.calories || 0,
            macros: req.body.macros || {},
            waterIntake: req.body.waterIntake || 0,
            notes: req.body.notes,
        });
        res.json({ success: true, data: log });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get nutrition logs for a date
router.get('/logs', authenticate, async (req: Request, res: Response) => {
    try {
        const { childId, studentId, date } = req.query;
        const targetId = childId || studentId || req.user?.id;
        const query: any = { type: 'log', childId: targetId };

        if (date) {
            const d = new Date(date as string);
            query.date = {
                $gte: new Date(d.setHours(0, 0, 0, 0)),
                $lte: new Date(d.setHours(23, 59, 59, 999)),
            };
        }

        const logs = await SmartNutritionModel.find(query).sort({ date: -1 }).limit(50).lean();

        // Calculate daily totals
        const totalCalories = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
        const totalWater = logs.reduce((sum, l) => sum + (l.waterIntake || 0), 0);
        const totalProtein = logs.reduce((sum, l) => sum + (l.macros?.protein || 0), 0);
        const totalCarbs = logs.reduce((sum, l) => sum + (l.macros?.carbs || 0), 0);
        const totalFats = logs.reduce((sum, l) => sum + (l.macros?.fats || 0), 0);

        res.json({
            success: true,
            data: {
                logs,
                dailyTotals: {
                    calories: totalCalories,
                    water: totalWater,
                    protein: totalProtein,
                    carbs: totalCarbs,
                    fats: totalFats,
                },
                count: logs.length,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update water intake for a log
router.put('/logs/:logId/water', authenticate, async (req: Request, res: Response) => {
    try {
        const { waterIntake } = req.body;
        const log = await SmartNutritionModel.findByIdAndUpdate(
            req.params.logId,
            { waterIntake, updatedAt: new Date() },
            { new: true }
        );
        if (!log) {
            return res.status(404).json({ success: false, error: 'Log not found' });
        }
        res.json({ success: true, data: log });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get nutrition history (date range)
router.get('/history', authenticate, async (req: Request, res: Response) => {
    try {
        const { childId, studentId, startDate, endDate } = req.query;
        const targetId = childId || studentId || req.user?.id;
        const query: any = { childId: targetId, type: { $in: ['log', 'tracking'] } };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }

        const history = await SmartNutritionModel.find(query).sort({ date: -1 }).limit(100).lean();

        // Group by date
        const grouped: Record<string, any> = {};
        history.forEach(entry => {
            const dateKey = entry.date ? new Date(entry.date).toISOString().split('T')[0] : 'unknown';
            if (!grouped[dateKey]) {
                grouped[dateKey] = { date: dateKey, entries: [], totalCalories: 0, totalWater: 0 };
            }
            grouped[dateKey].entries.push(entry);
            grouped[dateKey].totalCalories += entry.calories || 0;
            grouped[dateKey].totalWater += entry.waterIntake || 0;
        });

        res.json({
            success: true,
            data: {
                history: Object.values(grouped),
                totalDays: Object.keys(grouped).length,
                totalEntries: history.length,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Legacy tracking endpoint ──────────────────────────────────
router.post('/tracking', authenticate, async (req: Request, res: Response) => {
    try {
        const tracking = await service.trackNutrition(req.body);
        res.json({ success: true, data: tracking });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── AI-Powered Endpoints ──────────────────────────────────────

// Get AI nutrition recommendations
router.get('/recommendations/:childId', authenticate, async (req: Request, res: Response) => {
    try {
        const recommendations = await service.getNutritionRecommendations(req.params.childId);
        res.json({ success: true, data: recommendations });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate AI grocery list
router.post('/grocery-list', authenticate, async (req: Request, res: Response) => {
    try {
        const list = await service.generateGroceryList(req.body.mealPlanId);
        res.json({ success: true, data: list });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get grocery list for a specific meal plan (GET variant)
router.get('/meal-plans/:planId/grocery-list', authenticate, async (req: Request, res: Response) => {
    try {
        const list = await service.generateGroceryList(req.params.planId);
        res.json({ success: true, data: list });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get AI recipes
router.get('/recipes', authenticate, async (req: Request, res: Response) => {
    try {
        const recipes = await service.getRecipes(req.query.dietary as string);
        res.json({ success: true, data: recipes });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
