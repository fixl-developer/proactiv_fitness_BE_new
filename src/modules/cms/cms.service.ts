import { BaseService } from '../../shared/base/base.service';
import {
    HeroSlide, IHeroSlide,
    SiteStat, ISiteStat,
    ServiceCard, IServiceCard,
    Testimonial, ITestimonial,
    ClientPartner, IClientPartner,
    AboutContent, IAboutContent,
    AIFeature, IAIFeature,
    Assessment, IAssessment,
    ClassSession, IClassSession,
    PartyPackage, IPartyPackage,
    ProgramLevel, IProgramLevel,
    CampProgram, ICampProgram,
    LocationDetail, ILocationDetail,
    BlogPost, IBlogPost,
    JobPosition, IJobPosition,
    ContactInfo, IContactInfo,
    FAQItem, IFAQItem,
    NavMenuItem, INavMenuItem,
    PageContent, IPageContent,
    TeamMember, ITeamMember,
} from './cms.model';

// =============================================
// HERO SLIDES
// =============================================
export class HeroSlideService extends BaseService<IHeroSlide> {
    constructor() {
        super(HeroSlide, 'hero-slide');
    }

    async getActiveSlides(): Promise<IHeroSlide[]> {
        return HeroSlide.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// SITE STATS
// =============================================
export class SiteStatService extends BaseService<ISiteStat> {
    constructor() {
        super(SiteStat, 'site-stat');
    }

    async getActiveStats(): Promise<ISiteStat[]> {
        return SiteStat.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// SERVICE CARDS
// =============================================
export class ServiceCardService extends BaseService<IServiceCard> {
    constructor() {
        super(ServiceCard, 'service-card');
    }

    async getActiveServices(): Promise<IServiceCard[]> {
        return ServiceCard.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// TESTIMONIALS
// =============================================
export class TestimonialService extends BaseService<ITestimonial> {
    constructor() {
        super(Testimonial, 'testimonial');
    }

    async getActiveTestimonials(): Promise<ITestimonial[]> {
        return Testimonial.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// CLIENT PARTNERS
// =============================================
export class ClientPartnerService extends BaseService<IClientPartner> {
    constructor() {
        super(ClientPartner, 'client-partner');
    }

    async getActivePartners(): Promise<IClientPartner[]> {
        return ClientPartner.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// ABOUT CONTENT (Singleton)
// =============================================
export class AboutContentService extends BaseService<IAboutContent> {
    constructor() {
        super(AboutContent, 'about-content');
    }

    async getContent(): Promise<IAboutContent | null> {
        return AboutContent.findOne({ isDeleted: { $ne: true } });
    }

    async upsertContent(data: Partial<IAboutContent>): Promise<IAboutContent> {
        const existing = await AboutContent.findOne({ isDeleted: { $ne: true } });
        if (existing) {
            Object.assign(existing, data);
            return existing.save();
        }
        return AboutContent.create(data);
    }
}

// =============================================
// AI FEATURES
// =============================================
export class AIFeatureService extends BaseService<IAIFeature> {
    constructor() {
        super(AIFeature, 'ai-feature');
    }

    async getActiveFeatures(): Promise<IAIFeature[]> {
        return AIFeature.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// ASSESSMENTS
// =============================================
export class AssessmentService extends BaseService<IAssessment> {
    constructor() {
        super(Assessment, 'assessment');
    }

    async getActiveAssessments(): Promise<IAssessment[]> {
        return Assessment.find({ isActive: true, isDeleted: { $ne: true } }).sort({ category: 1, order: 1 });
    }

    async getByCategory(category: string): Promise<IAssessment[]> {
        return Assessment.find({ category, isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// CLASS SESSIONS
// =============================================
export class ClassSessionService extends BaseService<IClassSession> {
    constructor() {
        super(ClassSession, 'class-session');
    }

    async getActiveSessions(): Promise<IClassSession[]> {
        return ClassSession.find({ isActive: true, isDeleted: { $ne: true } }).sort({ category: 1, order: 1 });
    }

    async getByCategory(category: string): Promise<IClassSession[]> {
        return ClassSession.find({ category, isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }

    async getByLocation(location: string): Promise<IClassSession[]> {
        return ClassSession.find({ location, isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// PARTY PACKAGES
// =============================================
export class PartyPackageService extends BaseService<IPartyPackage> {
    constructor() {
        super(PartyPackage, 'party-package');
    }

    async getActivePackages(): Promise<IPartyPackage[]> {
        return PartyPackage.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// PROGRAM LEVELS
// =============================================
export class ProgramLevelService extends BaseService<IProgramLevel> {
    constructor() {
        super(ProgramLevel, 'program-level');
    }

    async getActiveLevels(): Promise<IProgramLevel[]> {
        return ProgramLevel.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// CAMP PROGRAMS
// =============================================
export class CampProgramService extends BaseService<ICampProgram> {
    constructor() {
        super(CampProgram, 'camp-program');
    }

    async getActivePrograms(): Promise<ICampProgram[]> {
        return CampProgram.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// LOCATION DETAILS
// =============================================
export class LocationDetailService extends BaseService<ILocationDetail> {
    constructor() {
        super(LocationDetail, 'location-detail');
    }

    async getBySlug(slug: string): Promise<ILocationDetail | null> {
        return LocationDetail.findOne({ slug, isActive: true, isDeleted: { $ne: true } });
    }

    async getActiveLocations(): Promise<ILocationDetail[]> {
        return LocationDetail.find({ isActive: true, isDeleted: { $ne: true } }).sort({ name: 1 });
    }
}

// =============================================
// BLOG POSTS
// =============================================
export class BlogPostService extends BaseService<IBlogPost> {
    constructor() {
        super(BlogPost, 'blog-post');
    }

    async getPublishedPosts(category?: string): Promise<IBlogPost[]> {
        const filter: any = { isPublished: true, isDeleted: { $ne: true } };
        if (category && category !== 'All Posts') {
            filter.category = category;
        }
        return BlogPost.find(filter).sort({ date: -1 });
    }

    async getBySlug(slug: string): Promise<IBlogPost | null> {
        return BlogPost.findOne({ slug, isPublished: true, isDeleted: { $ne: true } });
    }

    async getFeaturedPosts(): Promise<IBlogPost[]> {
        return BlogPost.find({ isFeatured: true, isPublished: true, isDeleted: { $ne: true } }).sort({ date: -1 }).limit(3);
    }
}

// =============================================
// JOB POSITIONS
// =============================================
export class JobPositionService extends BaseService<IJobPosition> {
    constructor() {
        super(JobPosition, 'job-position');
    }

    async getActivePositions(): Promise<IJobPosition[]> {
        return JobPosition.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}

// =============================================
// CONTACT INFO (Singleton)
// =============================================
export class ContactInfoService extends BaseService<IContactInfo> {
    constructor() {
        super(ContactInfo, 'contact-info');
    }

    async getContactInfo(): Promise<IContactInfo | null> {
        return ContactInfo.findOne({ isDeleted: { $ne: true } });
    }

    async upsertContactInfo(data: Partial<IContactInfo>): Promise<IContactInfo> {
        const existing = await ContactInfo.findOne({ isDeleted: { $ne: true } });
        if (existing) {
            Object.assign(existing, data);
            return existing.save();
        }
        return ContactInfo.create(data);
    }
}

// =============================================
// FAQ ITEMS
// =============================================
export class FAQItemService extends BaseService<IFAQItem> {
    constructor() {
        super(FAQItem, 'faq-item');
    }

    async getActiveByCategory(category: string): Promise<IFAQItem[]> {
        return FAQItem.find({ category, isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }

    async getActiveFAQs(): Promise<IFAQItem[]> {
        return FAQItem.find({ isActive: true, isDeleted: { $ne: true } }).sort({ category: 1, order: 1 });
    }
}

// =============================================
// NAV MENU ITEMS (Header)
// =============================================
export class NavMenuItemService extends BaseService<INavMenuItem> {
    constructor() {
        super(NavMenuItem, 'nav-menu-item');
    }

    async getActiveItems(): Promise<INavMenuItem[]> {
        return NavMenuItem.find({ isActive: true, isDeleted: { $ne: true } })
            .sort({ parentLabel: 1, order: 1 });
    }

    /**
     * Returns header nav as a tree:
     * [{ label, href, dropdown?: [{ label, href }] }, ...]
     * Items with parentLabel='' are top-level; others are dropdown children of their parent.
     */
    async getActiveTree(): Promise<Array<{ label: string; href: string; order: number; dropdown?: Array<{ label: string; href: string }> }>> {
        const all = await this.getActiveItems();
        const top = all.filter(i => !i.parentLabel).sort((a, b) => a.order - b.order);
        return top.map(parent => {
            const children = all
                .filter(c => c.parentLabel === parent.label)
                .sort((a, b) => a.order - b.order)
                .map(c => ({ label: c.label, href: c.href }));
            return {
                label: parent.label,
                href: parent.href,
                order: parent.order,
                ...(children.length > 0 ? { dropdown: children } : {}),
            };
        });
    }
}

// =============================================
// PAGE CONTENT (singleton-per-slug)
// =============================================
export class PageContentService extends BaseService<IPageContent> {
    constructor() {
        super(PageContent, 'page-content');
    }

    async getBySlug(slug: string): Promise<IPageContent | null> {
        return PageContent.findOne({ slug, isDeleted: { $ne: true } });
    }

    async getAll(): Promise<IPageContent[]> {
        return PageContent.find({ isDeleted: { $ne: true } }).sort({ name: 1 });
    }

    async upsertBySlug(slug: string, data: Partial<IPageContent>): Promise<IPageContent> {
        const existing = await PageContent.findOne({ slug, isDeleted: { $ne: true } });
        if (existing) {
            // Mongoose nested `.set` to merge hero/seo without losing untouched fields
            if (data.hero) existing.set('hero', { ...(existing.hero || {}), ...data.hero });
            if (data.seo) existing.set('seo', { ...(existing.seo || {}), ...data.seo });
            if (data.sections) existing.sections = data.sections as any;
            if (typeof data.name === 'string') existing.name = data.name;
            if (typeof data.isActive === 'boolean') existing.isActive = data.isActive;
            return existing.save();
        }
        return PageContent.create({ ...data, slug });
    }
}

// =============================================
// TEAM MEMBERS
// =============================================
export class TeamMemberService extends BaseService<ITeamMember> {
    constructor() {
        super(TeamMember, 'team-member');
    }

    async getActiveMembers(): Promise<ITeamMember[]> {
        return TeamMember.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1 });
    }
}
