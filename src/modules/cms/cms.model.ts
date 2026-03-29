import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '../../shared/base/base.model';

// =============================================
// 1. HERO SLIDE
// =============================================
export interface IHeroSlide extends Document {
    title: string;
    subtitle?: string;
    image: string;
    fallbackGradient?: string;
    ctaText?: string;
    ctaLink?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const heroSlideSchema = new Schema<IHeroSlide>({
    title: { type: String, required: [true, 'Title is required'] },
    subtitle: { type: String },
    image: { type: String, required: [true, 'Image URL is required'] },
    fallbackGradient: { type: String, default: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800' },
    ctaText: { type: String },
    ctaLink: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_hero_slides' });

heroSlideSchema.index({ order: 1, isActive: 1 });

export const HeroSlide = model<IHeroSlide>('HeroSlide', heroSlideSchema);

// =============================================
// 2. SITE STAT
// =============================================
export interface ISiteStat extends Document {
    label: string;
    value: number;
    suffix: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
}

const siteStatSchema = new Schema<ISiteStat>({
    label: { type: String, required: true },
    value: { type: Number, required: true },
    suffix: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: 'from-blue-400 to-cyan-400' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_site_stats' });

siteStatSchema.index({ order: 1 });

export const SiteStat = model<ISiteStat>('SiteStat', siteStatSchema);

// =============================================
// 3. SERVICE CARD
// =============================================
export interface IServiceCard extends Document {
    title: string;
    description: string;
    image: string;
    emoji: string;
    features: string[];
    href: string;
    color: string;
    gradient: string;
    order: number;
    isActive: boolean;
}

const serviceCardSchema = new Schema<IServiceCard>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    emoji: { type: String, default: '' },
    features: [{ type: String }],
    href: { type: String, required: true },
    color: { type: String, default: 'blue' },
    gradient: { type: String, default: 'from-blue-400 to-blue-600' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_service_cards' });

serviceCardSchema.index({ order: 1, isActive: 1 });

export const ServiceCard = model<IServiceCard>('ServiceCard', serviceCardSchema);

// =============================================
// 4. TESTIMONIAL
// =============================================
export interface ITestimonial extends Document {
    name: string;
    role: string;
    rating: number;
    text: string;
    image: string;
    fallbackGradient: string;
    program: string;
    isActive: boolean;
    order: number;
}

const testimonialSchema = new Schema<ITestimonial>({
    name: { type: String, required: true },
    role: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    image: { type: String, default: '' },
    fallbackGradient: { type: String, default: 'bg-gradient-to-br from-blue-400 to-cyan-500' },
    program: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_testimonials' });

testimonialSchema.index({ isActive: 1, order: 1 });

export const Testimonial = model<ITestimonial>('Testimonial', testimonialSchema);

// =============================================
// 5. CLIENT PARTNER
// =============================================
export interface IClientPartner extends Document {
    name: string;
    logo: string;
    fallbackText: string;
    color: string;
    order: number;
    isActive: boolean;
}

const clientPartnerSchema = new Schema<IClientPartner>({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    fallbackText: { type: String, default: '' },
    color: { type: String, default: 'from-blue-500 to-cyan-500' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_client_partners' });

clientPartnerSchema.index({ order: 1, isActive: 1 });

export const ClientPartner = model<IClientPartner>('ClientPartner', clientPartnerSchema);

// =============================================
// 6. ABOUT CONTENT (Singleton - only one document)
// =============================================
export interface IAboutContent extends Document {
    mission: string;
    vision: string;
    values: Array<{ title: string; description: string; icon: string }>;
    stats: Array<{ label: string; value: string; icon: string }>;
    images: string[];
    history: string;
    features: Array<{ title: string; description: string; icon: string }>;
}

const aboutContentSchema = new Schema<IAboutContent>({
    mission: { type: String, default: '' },
    vision: { type: String, default: '' },
    values: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: '' },
    }],
    stats: [{
        label: { type: String, required: true },
        value: { type: String, required: true },
        icon: { type: String, default: '' },
    }],
    images: [{ type: String }],
    history: { type: String, default: '' },
    features: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: '' },
    }],
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_about_content' });

export const AboutContent = model<IAboutContent>('AboutContent', aboutContentSchema);

// =============================================
// 7. AI FEATURE
// =============================================
export interface IAIFeature extends Document {
    title: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    order: number;
    isActive: boolean;
}

const aiFeatureSchema = new Schema<IAIFeature>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: 'from-blue-500 to-cyan-500' },
    bgColor: { type: String, default: 'bg-blue-50' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_ai_features' });

aiFeatureSchema.index({ order: 1, isActive: 1 });

export const AIFeature = model<IAIFeature>('AIFeature', aiFeatureSchema);

// =============================================
// 8. ASSESSMENT
// =============================================
export interface IAssessment extends Document {
    title: string;
    description: string;
    image: string;
    time: string;
    duration: string;
    days: string;
    ageGroup: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    price: string;
    isFree: boolean;
    availableSlots: number;
    totalSlots: number;
    category: string;
    location: string;
    order: number;
    isActive: boolean;
}

const assessmentSchema = new Schema<IAssessment>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, required: true },
    days: { type: String, required: true },
    ageGroup: { type: String, required: true },
    level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    price: { type: String, default: 'FREE' },
    isFree: { type: Boolean, default: true },
    availableSlots: { type: Number, required: true },
    totalSlots: { type: Number, required: true },
    category: { type: String, required: true },
    location: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_assessments' });

assessmentSchema.index({ category: 1, isActive: 1, order: 1 });

export const Assessment = model<IAssessment>('Assessment', assessmentSchema);

// =============================================
// 9. CLASS SESSION (for book-assessment classes section)
// =============================================
export interface IClassSession extends Document {
    title: string;
    description: string;
    image: string;
    time: string;
    duration: string;
    days: string;
    ageGroup: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    price: string;
    isFree: boolean;
    availableSlots: number;
    totalSlots: number;
    category: string;
    location: string;
    order: number;
    isActive: boolean;
}

const classSessionSchema = new Schema<IClassSession>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, required: true },
    days: { type: String, required: true },
    ageGroup: { type: String, required: true },
    level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    price: { type: String, required: true },
    isFree: { type: Boolean, default: false },
    availableSlots: { type: Number, required: true },
    totalSlots: { type: Number, required: true },
    category: { type: String, required: true },
    location: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_class_sessions' });

classSessionSchema.index({ category: 1, location: 1, isActive: 1, order: 1 });

export const ClassSession = model<IClassSession>('ClassSession', classSessionSchema);

// =============================================
// 10. PARTY PACKAGE
// =============================================
export interface IPartyPackage extends Document {
    name: string;
    duration: string;
    maxKids: number;
    coaches: number;
    partyRoomTime: string;
    features: string[];
    notIncluded: string[];
    price: string;
    image: string;
    order: number;
    isActive: boolean;
}

const partyPackageSchema = new Schema<IPartyPackage>({
    name: { type: String, required: true },
    duration: { type: String, required: true },
    maxKids: { type: Number, required: true },
    coaches: { type: Number, required: true },
    partyRoomTime: { type: String, default: '' },
    features: [{ type: String }],
    notIncluded: [{ type: String }],
    price: { type: String, default: 'Contact for Pricing' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_party_packages' });

partyPackageSchema.index({ order: 1, isActive: 1 });

export const PartyPackage = model<IPartyPackage>('PartyPackage', partyPackageSchema);

// =============================================
// 11. PROGRAM LEVEL
// =============================================
export interface IProgramLevel extends Document {
    name: string;
    description: string;
    image: string;
    ageGroup: string;
    duration: string;
    classSize: string;
    price: string;
    objectives: string[];
    schedule: Array<{ location: string; days: string; time: string }>;
    color: string;
    icon: string;
    order: number;
    isActive: boolean;
}

const programLevelSchema = new Schema<IProgramLevel>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    ageGroup: { type: String, required: true },
    duration: { type: String, required: true },
    classSize: { type: String, required: true },
    price: { type: String, required: true },
    objectives: [{ type: String }],
    schedule: [{
        location: { type: String, required: true },
        days: { type: String, required: true },
        time: { type: String, required: true },
    }],
    color: { type: String, default: 'blue' },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_program_levels' });

programLevelSchema.index({ order: 1, isActive: 1 });

export const ProgramLevel = model<IProgramLevel>('ProgramLevel', programLevelSchema);

// =============================================
// 12. CAMP PROGRAM
// =============================================
export interface ICampProgram extends Document {
    title: string;
    description: string;
    image: string;
    dates: string;
    price: string;
    ageGroup: string;
    activities: string[];
    features: string[];
    location: string;
    order: number;
    isActive: boolean;
}

const campProgramSchema = new Schema<ICampProgram>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    dates: { type: String, required: true },
    price: { type: String, required: true },
    ageGroup: { type: String, required: true },
    activities: [{ type: String }],
    features: [{ type: String }],
    location: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_camp_programs' });

campProgramSchema.index({ order: 1, isActive: 1 });

export const CampProgram = model<ICampProgram>('CampProgram', campProgramSchema);

// =============================================
// 13. LOCATION DETAIL
// =============================================
export interface ILocationDetail extends Document {
    name: string;
    slug: string;
    address: string;
    phone: string;
    email: string;
    hours: Array<{ day: string; time: string }>;
    facilities: Array<{ name: string; description: string; features: string[] }>;
    schedule: Array<{
        day: string;
        slots: Array<{
            time: string;
            program: string;
            ageGroup: string;
            level: string;
            spots: string;
        }>;
    }>;
    team: Array<{
        name: string;
        role: string;
        specialization: string;
        experience: string;
        image: string;
    }>;
    images: string[];
    mapUrl: string;
    isActive: boolean;
}

const locationDetailSchema = new Schema<ILocationDetail>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    hours: [{
        day: { type: String, required: true },
        time: { type: String, required: true },
    }],
    facilities: [{
        name: { type: String, required: true },
        description: { type: String, default: '' },
        features: [{ type: String }],
    }],
    schedule: [{
        day: { type: String, required: true },
        slots: [{
            time: { type: String, required: true },
            program: { type: String, required: true },
            ageGroup: { type: String, default: '' },
            level: { type: String, default: '' },
            spots: { type: String, default: '' },
        }],
    }],
    team: [{
        name: { type: String, required: true },
        role: { type: String, required: true },
        specialization: { type: String, default: '' },
        experience: { type: String, default: '' },
        image: { type: String, default: '' },
    }],
    images: [{ type: String }],
    mapUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_location_details' });

locationDetailSchema.index({ slug: 1 });

export const LocationDetail = model<ILocationDetail>('LocationDetail', locationDetailSchema);

// =============================================
// 14. BLOG POST
// =============================================
export interface IBlogPost extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    authorImage: string;
    date: Date;
    category: string;
    tags: string[];
    image: string;
    readTime: string;
    isFeatured: boolean;
    isPublished: boolean;
}

const blogPostSchema = new Schema<IBlogPost>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorImage: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    tags: [{ type: String }],
    image: { type: String, default: '' },
    readTime: { type: String, default: '5 min read' },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_blog_posts' });

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ isPublished: 1, date: -1 });
blogPostSchema.index({ category: 1, isPublished: 1 });

export const BlogPost = model<IBlogPost>('BlogPost', blogPostSchema);

// =============================================
// 15. JOB POSITION
// =============================================
export interface IJobPosition extends Document {
    title: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    salary: string;
    image: string;
    isActive: boolean;
    order: number;
}

const jobPositionSchema = new Schema<IJobPosition>({
    title: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, default: '' },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    benefits: [{ type: String }],
    salary: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_job_positions' });

jobPositionSchema.index({ isActive: 1, order: 1 });

export const JobPosition = model<IJobPosition>('JobPosition', jobPositionSchema);

// =============================================
// 16. CONTACT INFO (Singleton)
// =============================================
export interface IContactInfo extends Document {
    phone: string;
    email: string;
    address: string;
    hours: string;
    whatsapp: string;
    socialLinks: Array<{ platform: string; url: string; icon: string }>;
    mapUrl: string;
}

const contactInfoSchema = new Schema<IContactInfo>({
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    hours: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    socialLinks: [{
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: '' },
    }],
    mapUrl: { type: String, default: '' },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_contact_info' });

export const ContactInfo = model<IContactInfo>('ContactInfo', contactInfoSchema);

// =============================================
// 17. FAQ ITEM
// =============================================
export interface IFAQItem extends Document {
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
}

const faqItemSchema = new Schema<IFAQItem>({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...baseSchemaFields,
}, { ...baseSchemaOptions, timestamps: true, collection: 'cms_faq_items' });

faqItemSchema.index({ category: 1, order: 1, isActive: 1 });

export const FAQItem = model<IFAQItem>('FAQItem', faqItemSchema);
