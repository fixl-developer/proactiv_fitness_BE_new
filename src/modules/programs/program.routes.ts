import { Router } from 'express';
import { ProgramController } from './program.controller';
import { authenticate, authorize } from '../iam/auth.middleware';
import { validateBody, validateParams } from '../../middleware/joi-validation.middleware';
import { UserRole } from '../../shared/enums';
import {
    createProgramValidation,
    updateProgramValidation,
    programEligibilityValidation,
    duplicateProgramValidation,
    idParamValidation
} from './program.validation';

const router = Router();
const programController = new ProgramController();

// =============================================
// PUBLIC LISTING (no auth) — returns only active + public programs
// so anonymous visitors on the marketing site can see what admin has published.
// Mounted BEFORE the authenticate middleware so it's reachable without a token.
// =============================================
router.get('/public', (req: any, res: any, next: any) => {
    // Force the public filters and delegate to the standard controller.
    req.query = { ...(req.query || {}), isActive: 'true', isPublic: 'true' };
    return programController.getPrograms(req, res, next);
});

router.get('/public/:id', (req: any, res: any, next: any) => {
    return programController.getProgramById(req, res, next);
});

// Apply authentication to all routes below
router.use(authenticate);

// Public routes (authenticated users)
router.get(
    '/',
    programController.getPrograms
);

router.get(
    '/search',
    programController.searchPrograms
);

router.get(
    '/categories',
    programController.getCategories
);

router.get(
    '/statistics',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
    programController.getProgramStatistics
);

router.get(
    '/category/:category',
    programController.getProgramsByCategory
);

router.get(
    '/age/:age/:ageType',
    programController.getProgramsForAge
);

router.get(
    '/:id',
    validateParams(idParamValidation),
    programController.getProgramById
);

router.get(
    '/:id/pricing',
    validateParams(idParamValidation),
    programController.getProgramPricing
);

// Protected routes (admin/manager only)
//
// POST / has two flavors. The strict path runs the full createProgramValidation
// (used by external callers / migrations that supply the canonical schema).
// The admin shim below is hit only when the body looks like the simplified UI
// payload (no shortDescription / programType / category) and the caller is an
// admin role — it auto-fills the required fields from sensible defaults so the
// admin Program Catalog "Add Program" form works without forcing the admin to
// fill 12 fields manually.
router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: any, res: any, next: any) => {
        try {
            const body = req.body || {};
            const looksFull = body.shortDescription && body.programType && body.category && body.businessUnitId;
            if (looksFull) return next(); // defer to strict validator + controller below

            // Otherwise auto-fill required fields and bypass strict validator.
            const { Program } = require('./program.model');
            const { Location } = require('../bcms/location.model');

            // Resolve a businessUnitId: prefer body, then any existing program's, then any active location's.
            let businessUnitId = body.businessUnitId;
            if (!businessUnitId) {
                const sample = await Program.findOne({}).select('businessUnitId').lean().catch(() => null);
                businessUnitId = sample?.businessUnitId;
            }
            if (!businessUnitId) {
                const loc = await Location.findOne({ isDeleted: { $ne: true } }).select('businessUnitId').lean().catch(() => null);
                businessUnitId = loc?.businessUnitId;
            }
            if (!businessUnitId) {
                return res.status(400).json({
                    success: false,
                    message: 'businessUnitId required (no defaults available — create a Business Unit first)',
                });
            }

            // Resolve a locationId for locationIds[] (required: at least one)
            let locationIds: string[] = Array.isArray(body.locationIds) ? body.locationIds : [];
            if (locationIds.length === 0) {
                const sampleLoc = await Location.findOne({ isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
                if (sampleLoc?._id) locationIds = [String(sampleLoc._id)];
            }
            if (locationIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one locationId is required (no locations exist — create one first)',
                });
            }

            // Map UI fields → canonical Mongoose schema
            const ageGroup = body.ageGroup || '';
            const ageMatch = String(ageGroup).match(/(\d+)\s*-\s*(\d+)/);
            const minAge = ageMatch ? Number(ageMatch[1]) : 5;
            const maxAge = ageMatch ? Number(ageMatch[2]) : 17;

            const skillLevelLower = String(body.level || 'beginner').toLowerCase();
            const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
            const skillLevel = validSkillLevels.includes(skillLevelLower) ? skillLevelLower : 'beginner';

            const programTypeLower = String(body.programType || body.type || 'regular').toLowerCase();
            const validProgramTypes = ['regular', 'camp', 'event', 'private', 'assessment', 'party', 'trial'];
            const programType = validProgramTypes.includes(programTypeLower) ? programTypeLower : 'regular';

            const capacityNum = Number(body.capacity) || 20;

            const doc: any = {
                programId: `PRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,

                // Basic
                name: body.name,
                description: body.description || body.name,
                shortDescription: body.shortDescription || (body.description ? String(body.description).slice(0, 200) : body.name),
                programType,
                category: body.category || 'gymnastics',
                subcategory: body.subcategory,

                // Organization
                businessUnitId,
                locationIds,

                // Age and Skill — use proper subschemas
                ageGroups: Array.isArray(body.ageGroups) && body.ageGroups.length > 0 ? body.ageGroups : [{
                    minAge,
                    maxAge,
                    ageType: 'years',
                    description: ageGroup || `Ages ${minAge}-${maxAge}`,
                }],
                skillLevels: Array.isArray(body.skillLevels) && body.skillLevels.length > 0
                    ? body.skillLevels.map((s: any) => typeof s === 'string' ? s.toLowerCase() : (s.name || skillLevel).toLowerCase())
                    : [skillLevel],

                // Capacity rules — required full object
                capacityRules: body.capacityRules || {
                    minParticipants: 1,
                    maxParticipants: capacityNum,
                    coachToParticipantRatio: Math.max(1, Math.ceil(capacityNum / 8)),
                    waitlistCapacity: Math.ceil(capacityNum / 4),
                },

                // Eligibility rules — required
                eligibilityRules: body.eligibilityRules || {
                    ageRestrictions: {
                        minAge,
                        maxAge,
                        ageType: 'years',
                        description: `Ages ${minAge}-${maxAge}`,
                    },
                    skillLevelRequired: skillLevel,
                    prerequisites: [],
                },

                // Pricing model — required
                pricingModel: body.pricingModel || {
                    basePrice: Number(body.price) || 0,
                    currency: body.currency || 'HKD',
                    pricingType: 'per_term',
                },

                // Class templates — at least one required
                classTemplates: Array.isArray(body.classTemplates) && body.classTemplates.length > 0 ? body.classTemplates : [{
                    name: `${body.name} - Standard Class`,
                    description: `Standard class template for ${body.name}`,
                    duration: 60,
                    activities: ['Warm-up', 'Skill practice', 'Cool-down'],
                    equipment: [],
                    learningObjectives: [`Learn ${body.name}`],
                }],

                // Session/term defaults
                sessionDuration: Number(body.sessionDuration) || 60,
                sessionsPerWeek: Number(body.sessionsPerWeek) || 1,
                termDuration: Number(body.termDuration) || 12,

                // Status
                status: body.status ? String(body.status).toLowerCase() : 'active',
                isActive: body.isActive !== false,
                createdBy: req.user?.id,
                updatedBy: req.user?.id,
            };

            const created = await Program.create(doc);
            return res.status(201).json({ success: true, message: 'Program created (admin shim)', data: created });
        } catch (error: any) {
            console.error('Program admin-shim create error:', error?.message);
            return res.status(500).json({ success: false, message: error?.message || 'Failed to create program' });
        }
    },
    validateBody(createProgramValidation),
    programController.createProgram
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    validateBody(updateProgramValidation),
    programController.updateProgram
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    programController.deleteProgram
);

router.post(
    '/:id/duplicate',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    validateBody(duplicateProgramValidation),
    programController.duplicateProgram
);

router.patch(
    '/:id/status',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    programController.toggleProgramStatus
);

// Enrollment eligibility check
router.post(
    '/:id/check-eligibility',
    validateParams(idParamValidation),
    validateBody(programEligibilityValidation),
    programController.checkEligibility
);

export default router;