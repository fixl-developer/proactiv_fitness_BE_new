import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { ResponseUtil } from '../../shared/utils/response.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import {
    HeroSlideService,
    SiteStatService,
    ServiceCardService,
    TestimonialService,
    ClientPartnerService,
    AboutContentService,
    AIFeatureService,
    AssessmentService,
    ClassSessionService,
    PartyPackageService,
    ProgramLevelService,
    CampProgramService,
    LocationDetailService,
    BlogPostService,
    JobPositionService,
    ContactInfoService,
    FAQItemService,
} from './cms.service';

// =============================================
// PUBLIC CONTROLLER (No Auth Required)
// =============================================
export class CMSPublicController {
    private heroSlideService = new HeroSlideService();
    private siteStatService = new SiteStatService();
    private serviceCardService = new ServiceCardService();
    private testimonialService = new TestimonialService();
    private clientPartnerService = new ClientPartnerService();
    private aboutContentService = new AboutContentService();
    private aiFeatureService = new AIFeatureService();
    private assessmentService = new AssessmentService();
    private classSessionService = new ClassSessionService();
    private partyPackageService = new PartyPackageService();
    private programLevelService = new ProgramLevelService();
    private campProgramService = new CampProgramService();
    private locationDetailService = new LocationDetailService();
    private blogPostService = new BlogPostService();
    private jobPositionService = new JobPositionService();
    private contactInfoService = new ContactInfoService();
    private faqItemService = new FAQItemService();

    // --- Hero Slides ---
    getHeroSlides = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.heroSlideService.getActiveSlides();
        ResponseUtil.success(res, data);
    });

    // --- Site Stats ---
    getSiteStats = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.siteStatService.getActiveStats();
        ResponseUtil.success(res, data);
    });

    // --- Services ---
    getServices = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.serviceCardService.getActiveServices();
        ResponseUtil.success(res, data);
    });

    // --- Testimonials ---
    getTestimonials = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.testimonialService.getActiveTestimonials();
        ResponseUtil.success(res, data);
    });

    // --- Partners ---
    getPartners = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.clientPartnerService.getActivePartners();
        ResponseUtil.success(res, data);
    });

    // --- About ---
    getAbout = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.aboutContentService.getContent();
        ResponseUtil.success(res, data);
    });

    // --- AI Features ---
    getAIFeatures = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.aiFeatureService.getActiveFeatures();
        ResponseUtil.success(res, data);
    });

    // --- Assessments ---
    getAssessments = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.assessmentService.getActiveAssessments();
        ResponseUtil.success(res, data);
    });

    // --- Class Sessions ---
    getClassSessions = asyncHandler(async (req: Request, res: Response) => {
        const { category, location } = req.query;
        let data;
        if (category) {
            data = await this.classSessionService.getByCategory(category as string);
        } else if (location) {
            data = await this.classSessionService.getByLocation(location as string);
        } else {
            data = await this.classSessionService.getActiveSessions();
        }
        ResponseUtil.success(res, data);
    });

    // --- Party Packages ---
    getPartyPackages = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.partyPackageService.getActivePackages();
        ResponseUtil.success(res, data);
    });

    // --- Program Levels ---
    getProgramLevels = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.programLevelService.getActiveLevels();
        ResponseUtil.success(res, data);
    });

    // --- Camp Programs ---
    getCampPrograms = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.campProgramService.getActivePrograms();
        ResponseUtil.success(res, data);
    });

    // --- Location Details ---
    getLocationBySlug = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.locationDetailService.getBySlug(req.params.slug);
        if (!data) throw new AppError('Location not found', HTTP_STATUS.NOT_FOUND);
        ResponseUtil.success(res, data);
    });

    getLocations = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.locationDetailService.getActiveLocations();
        ResponseUtil.success(res, data);
    });

    // --- Blog ---
    getBlogPosts = asyncHandler(async (req: Request, res: Response) => {
        const { category } = req.query;
        const data = await this.blogPostService.getPublishedPosts(category as string);
        ResponseUtil.success(res, data);
    });

    getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.blogPostService.getBySlug(req.params.slug);
        if (!data) throw new AppError('Blog post not found', HTTP_STATUS.NOT_FOUND);
        ResponseUtil.success(res, data);
    });

    getFeaturedBlogPosts = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.blogPostService.getFeaturedPosts();
        ResponseUtil.success(res, data);
    });

    // --- Careers ---
    getJobPositions = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.jobPositionService.getActivePositions();
        ResponseUtil.success(res, data);
    });

    // --- Contact Info ---
    getContactInfo = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.contactInfoService.getContactInfo();
        ResponseUtil.success(res, data);
    });

    // --- FAQs ---
    getFAQs = asyncHandler(async (req: Request, res: Response) => {
        const { category } = req.query;
        let data;
        if (category) {
            data = await this.faqItemService.getActiveByCategory(category as string);
        } else {
            data = await this.faqItemService.getActiveFAQs();
        }
        ResponseUtil.success(res, data);
    });

    // --- Landing Page Bundle (all data in one call) ---
    getLandingPageData = asyncHandler(async (_req: Request, res: Response) => {
        const [heroSlides, stats, services, testimonials, partners, about, aiFeatures] = await Promise.all([
            this.heroSlideService.getActiveSlides(),
            this.siteStatService.getActiveStats(),
            this.serviceCardService.getActiveServices(),
            this.testimonialService.getActiveTestimonials(),
            this.clientPartnerService.getActivePartners(),
            this.aboutContentService.getContent(),
            this.aiFeatureService.getActiveFeatures(),
        ]);
        ResponseUtil.success(res, { heroSlides, stats, services, testimonials, partners, about, aiFeatures });
    });
}

// =============================================
// ADMIN CONTROLLER (Auth + Admin Role Required)
// =============================================
export class CMSAdminController {
    private heroSlideService = new HeroSlideService();
    private siteStatService = new SiteStatService();
    private serviceCardService = new ServiceCardService();
    private testimonialService = new TestimonialService();
    private clientPartnerService = new ClientPartnerService();
    private aboutContentService = new AboutContentService();
    private aiFeatureService = new AIFeatureService();
    private assessmentService = new AssessmentService();
    private classSessionService = new ClassSessionService();
    private partyPackageService = new PartyPackageService();
    private programLevelService = new ProgramLevelService();
    private campProgramService = new CampProgramService();
    private locationDetailService = new LocationDetailService();
    private blogPostService = new BlogPostService();
    private jobPositionService = new JobPositionService();
    private contactInfoService = new ContactInfoService();
    private faqItemService = new FAQItemService();

    // ==========================================
    // Generic CRUD helper factory
    // ==========================================
    private createCRUD(service: any) {
        return {
            create: asyncHandler(async (req: Request, res: Response) => {
                const result = await service.create({ ...req.body, createdBy: req.user?.id });
                ResponseUtil.created(res, result);
            }),
            getAll: asyncHandler(async (req: Request, res: Response) => {
                const result = await service.findWithPagination(
                    { isDeleted: { $ne: true } },
                    req.query
                );
                ResponseUtil.success(res, result);
            }),
            getById: asyncHandler(async (req: Request, res: Response) => {
                const item = await service.findById(req.params.id);
                if (!item) throw new AppError('Not found', HTTP_STATUS.NOT_FOUND);
                ResponseUtil.success(res, item);
            }),
            update: asyncHandler(async (req: Request, res: Response) => {
                const result = await service.update(req.params.id, { ...req.body, updatedBy: req.user?.id });
                if (!result) throw new AppError('Not found', HTTP_STATUS.NOT_FOUND);
                ResponseUtil.success(res, result, 'Updated successfully');
            }),
            delete: asyncHandler(async (req: Request, res: Response) => {
                const success = await service.delete(req.params.id);
                if (!success) throw new AppError('Not found', HTTP_STATUS.NOT_FOUND);
                ResponseUtil.success(res, null, 'Deleted successfully');
            }),
        };
    }

    // --- Hero Slides CRUD ---
    heroSlides = this.createCRUD(this.heroSlideService);

    // --- Site Stats CRUD ---
    siteStats = this.createCRUD(this.siteStatService);

    // --- Service Cards CRUD ---
    serviceCards = this.createCRUD(this.serviceCardService);

    // --- Testimonials CRUD ---
    testimonials = this.createCRUD(this.testimonialService);

    // --- Client Partners CRUD ---
    clientPartners = this.createCRUD(this.clientPartnerService);

    // --- AI Features CRUD ---
    aiFeatures = this.createCRUD(this.aiFeatureService);

    // --- Assessments CRUD ---
    assessments = this.createCRUD(this.assessmentService);

    // --- Class Sessions CRUD ---
    classSessions = this.createCRUD(this.classSessionService);

    // --- Party Packages CRUD ---
    partyPackages = this.createCRUD(this.partyPackageService);

    // --- Program Levels CRUD ---
    programLevels = this.createCRUD(this.programLevelService);

    // --- Camp Programs CRUD ---
    campPrograms = this.createCRUD(this.campProgramService);

    // --- Location Details CRUD ---
    locationDetails = this.createCRUD(this.locationDetailService);

    // --- Blog Posts CRUD ---
    blogPosts = this.createCRUD(this.blogPostService);

    // --- Job Positions CRUD ---
    jobPositions = this.createCRUD(this.jobPositionService);

    // --- FAQ Items CRUD ---
    faqItems = this.createCRUD(this.faqItemService);

    // --- About Content (Singleton - upsert) ---
    getAboutContent = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.aboutContentService.getContent();
        ResponseUtil.success(res, data);
    });

    upsertAboutContent = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.aboutContentService.upsertContent(req.body);
        ResponseUtil.success(res, result, 'About content updated');
    });

    // --- Contact Info (Singleton - upsert) ---
    getContactInfo = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.contactInfoService.getContactInfo();
        ResponseUtil.success(res, data);
    });

    upsertContactInfo = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.contactInfoService.upsertContactInfo(req.body);
        ResponseUtil.success(res, result, 'Contact info updated');
    });
}
