import { Router } from 'express';
import { CMSPublicController, CMSAdminController } from './cms.controller';
import { authenticate, authorize } from '../iam/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { UserRole } from '../../shared/enums';

const publicRouter = Router();
const adminRouter = Router();
const publicCtrl = new CMSPublicController();
const adminCtrl = new CMSAdminController();

// =============================================
// PUBLIC ROUTES (No Auth - for frontend website)
// =============================================

// Bundle endpoint - get all landing page data in one call
publicRouter.get('/landing-page', publicCtrl.getLandingPageData);

// Hero Slides
publicRouter.get('/hero-slides', publicCtrl.getHeroSlides);

// Site Stats
publicRouter.get('/stats', publicCtrl.getSiteStats);

// Services
publicRouter.get('/services', publicCtrl.getServices);

// Testimonials
publicRouter.get('/testimonials', publicCtrl.getTestimonials);

// Client Partners
publicRouter.get('/partners', publicCtrl.getPartners);

// About
publicRouter.get('/about', publicCtrl.getAbout);

// AI Features
publicRouter.get('/ai-features', publicCtrl.getAIFeatures);

// Assessments
publicRouter.get('/assessments', publicCtrl.getAssessments);

// Class Sessions
publicRouter.get('/classes', publicCtrl.getClassSessions);

// Party Packages
publicRouter.get('/party-packages', publicCtrl.getPartyPackages);

// Program Levels
publicRouter.get('/programs', publicCtrl.getProgramLevels);

// Camp Programs
publicRouter.get('/camps', publicCtrl.getCampPrograms);

// Locations
publicRouter.get('/locations', publicCtrl.getLocations);
publicRouter.get('/locations/:slug', publicCtrl.getLocationBySlug);

// Blog
publicRouter.get('/blog', publicCtrl.getBlogPosts);
publicRouter.get('/blog/featured', publicCtrl.getFeaturedBlogPosts);
publicRouter.get('/blog/:slug', publicCtrl.getBlogBySlug);

// Careers
publicRouter.get('/careers', publicCtrl.getJobPositions);

// Contact Info
publicRouter.get('/contact-info', publicCtrl.getContactInfo);

// FAQs
publicRouter.get('/faqs', publicCtrl.getFAQs);

// =============================================
// ADMIN ROUTES (Auth + Admin Role Required)
// =============================================
const adminRoles = [UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER];

// Helper: common CRUD route setup
function setupCRUD(
    router: Router,
    path: string,
    crud: { create: any; getAll: any; getById: any; update: any; delete: any },
    requiredFields: Array<{ field: string; type: string }>
) {
    // Create
    const createValidators = requiredFields.map(f => {
        if (f.type === 'string') return body(f.field).isString().notEmpty().withMessage(`${f.field} is required`);
        if (f.type === 'number') return body(f.field).isNumeric().withMessage(`${f.field} must be a number`);
        if (f.type === 'boolean') return body(f.field).optional().isBoolean();
        return body(f.field).notEmpty();
    });

    router.post(path,
        authenticate, authorize(...adminRoles),
        ...createValidators, validate,
        crud.create
    );

    // Get All (paginated)
    router.get(path,
        authenticate, authorize(...adminRoles),
        crud.getAll
    );

    // Get By ID
    router.get(`${path}/:id`,
        authenticate, authorize(...adminRoles),
        param('id').isMongoId().withMessage('Valid ID required'), validate,
        crud.getById
    );

    // Update
    router.patch(`${path}/:id`,
        authenticate, authorize(...adminRoles),
        param('id').isMongoId().withMessage('Valid ID required'), validate,
        crud.update
    );

    // Delete
    router.delete(`${path}/:id`,
        authenticate, authorize(...adminRoles),
        param('id').isMongoId().withMessage('Valid ID required'), validate,
        crud.delete
    );
}

// --- Hero Slides ---
setupCRUD(adminRouter, '/hero-slides', adminCtrl.heroSlides, [
    { field: 'title', type: 'string' },
    { field: 'image', type: 'string' },
]);

// --- Site Stats ---
setupCRUD(adminRouter, '/stats', adminCtrl.siteStats, [
    { field: 'label', type: 'string' },
    { field: 'value', type: 'number' },
]);

// --- Service Cards ---
setupCRUD(adminRouter, '/services', adminCtrl.serviceCards, [
    { field: 'title', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'image', type: 'string' },
    { field: 'href', type: 'string' },
]);

// --- Testimonials ---
setupCRUD(adminRouter, '/testimonials', adminCtrl.testimonials, [
    { field: 'name', type: 'string' },
    { field: 'role', type: 'string' },
    { field: 'text', type: 'string' },
    { field: 'rating', type: 'number' },
]);

// --- Client Partners ---
setupCRUD(adminRouter, '/partners', adminCtrl.clientPartners, [
    { field: 'name', type: 'string' },
    { field: 'logo', type: 'string' },
]);

// --- AI Features ---
setupCRUD(adminRouter, '/ai-features', adminCtrl.aiFeatures, [
    { field: 'title', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'icon', type: 'string' },
]);

// --- Assessments ---
setupCRUD(adminRouter, '/assessments', adminCtrl.assessments, [
    { field: 'title', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'image', type: 'string' },
    { field: 'time', type: 'string' },
    { field: 'duration', type: 'string' },
    { field: 'days', type: 'string' },
    { field: 'ageGroup', type: 'string' },
    { field: 'category', type: 'string' },
    { field: 'availableSlots', type: 'number' },
    { field: 'totalSlots', type: 'number' },
]);

// --- Class Sessions ---
setupCRUD(adminRouter, '/classes', adminCtrl.classSessions, [
    { field: 'title', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'image', type: 'string' },
    { field: 'time', type: 'string' },
    { field: 'duration', type: 'string' },
    { field: 'days', type: 'string' },
    { field: 'ageGroup', type: 'string' },
    { field: 'price', type: 'string' },
    { field: 'category', type: 'string' },
    { field: 'availableSlots', type: 'number' },
    { field: 'totalSlots', type: 'number' },
]);

// --- Party Packages ---
setupCRUD(adminRouter, '/party-packages', adminCtrl.partyPackages, [
    { field: 'name', type: 'string' },
    { field: 'duration', type: 'string' },
    { field: 'maxKids', type: 'number' },
    { field: 'coaches', type: 'number' },
]);

// --- Program Levels ---
setupCRUD(adminRouter, '/programs', adminCtrl.programLevels, [
    { field: 'name', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'ageGroup', type: 'string' },
    { field: 'duration', type: 'string' },
    { field: 'classSize', type: 'string' },
    { field: 'price', type: 'string' },
]);

// --- Camp Programs ---
setupCRUD(adminRouter, '/camps', adminCtrl.campPrograms, [
    { field: 'title', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'dates', type: 'string' },
    { field: 'price', type: 'string' },
    { field: 'ageGroup', type: 'string' },
]);

// --- Location Details ---
setupCRUD(adminRouter, '/locations', adminCtrl.locationDetails, [
    { field: 'name', type: 'string' },
    { field: 'slug', type: 'string' },
    { field: 'address', type: 'string' },
]);

// --- Blog Posts ---
setupCRUD(adminRouter, '/blog', adminCtrl.blogPosts, [
    { field: 'title', type: 'string' },
    { field: 'slug', type: 'string' },
    { field: 'excerpt', type: 'string' },
    { field: 'content', type: 'string' },
    { field: 'author', type: 'string' },
    { field: 'category', type: 'string' },
]);

// --- Job Positions ---
setupCRUD(adminRouter, '/careers', adminCtrl.jobPositions, [
    { field: 'title', type: 'string' },
    { field: 'location', type: 'string' },
    { field: 'type', type: 'string' },
]);

// --- FAQ Items ---
setupCRUD(adminRouter, '/faqs', adminCtrl.faqItems, [
    { field: 'question', type: 'string' },
    { field: 'answer', type: 'string' },
    { field: 'category', type: 'string' },
]);

// --- About Content (Singleton) ---
adminRouter.get('/about',
    authenticate, authorize(...adminRoles),
    adminCtrl.getAboutContent
);
adminRouter.put('/about',
    authenticate, authorize(...adminRoles),
    adminCtrl.upsertAboutContent
);

// --- Contact Info (Singleton) ---
adminRouter.get('/contact-info',
    authenticate, authorize(...adminRoles),
    adminCtrl.getContactInfo
);
adminRouter.put('/contact-info',
    authenticate, authorize(...adminRoles),
    adminCtrl.upsertContactInfo
);

export { publicRouter as cmsPublicRoutes, adminRouter as cmsAdminRoutes };
