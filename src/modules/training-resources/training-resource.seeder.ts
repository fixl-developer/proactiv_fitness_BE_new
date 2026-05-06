import { Types } from 'mongoose';
import { TrainingResource } from './training-resource.model';
import logger from '../../shared/utils/logger.util';

const SEED_PLACEHOLDER_USER_ID = new Types.ObjectId('000000000000000000000001');

interface SeedItem {
    title: string;
    description: string;
    url: string;
    type: 'document' | 'video' | 'article' | 'course' | 'link' | 'pdf';
    category:
        | 'customer-service'
        | 'product-knowledge'
        | 'tools-systems'
        | 'soft-skills'
        | 'compliance'
        | 'onboarding'
        | 'other';
    tags: string[];
    estimatedMinutes: number;
    featured?: boolean;
}

const DEFAULT_RESOURCES: SeedItem[] = [
    {
        title: 'Customer Service Excellence — Fundamentals',
        description:
            'A 45-minute introduction to handling support conversations with empathy, clear language, and resolution-focused replies. Recommended starting point for new support staff.',
        url: 'https://www.youtube.com/results?search_query=customer+service+fundamentals',
        type: 'video',
        category: 'customer-service',
        tags: ['onboarding', 'fundamentals'],
        estimatedMinutes: 45,
        featured: true,
    },
    {
        title: 'Active Listening for Support Agents',
        description:
            'Practical techniques for active listening: paraphrasing, summarising, and acknowledging emotion. Useful for de-escalating frustrated customers.',
        url: 'https://www.helpscout.com/blog/active-listening/',
        type: 'article',
        category: 'soft-skills',
        tags: ['communication', 'de-escalation'],
        estimatedMinutes: 12,
    },
    {
        title: 'Proactiv Fitness — Programs Overview',
        description:
            'Internal product knowledge: programs we offer, age groups, term structure, pricing tiers, common parent questions.',
        url: 'https://docs.google.com/document/d/example-programs-overview',
        type: 'document',
        category: 'product-knowledge',
        tags: ['internal', 'programs'],
        estimatedMinutes: 25,
        featured: true,
    },
    {
        title: 'Using the Support Ticket System',
        description:
            'How to triage incoming tickets, set priority, assign, escalate, and close. Keyboard shortcuts and saved replies.',
        url: 'https://docs.google.com/document/d/example-ticket-sop',
        type: 'document',
        category: 'tools-systems',
        tags: ['sop', 'tools'],
        estimatedMinutes: 15,
    },
    {
        title: 'Handling Refund and Cancellation Requests',
        description:
            'Step-by-step playbook for refund requests, cancellation policies by program type, and the approval matrix.',
        url: 'https://docs.google.com/document/d/example-refund-playbook',
        type: 'document',
        category: 'compliance',
        tags: ['refunds', 'policy'],
        estimatedMinutes: 20,
    },
    {
        title: 'Empathy in Written Communication',
        description:
            '10-minute read on writing chat and email replies that feel human. Real examples (good vs bad) for common scenarios.',
        url: 'https://www.intercom.com/blog/customer-support-skills/',
        type: 'article',
        category: 'soft-skills',
        tags: ['writing', 'tone'],
        estimatedMinutes: 10,
    },
    {
        title: 'Data Protection & Member Privacy',
        description:
            'What customer data you can and cannot share, data retention rules, and incident reporting workflow.',
        url: 'https://docs.google.com/document/d/example-data-protection',
        type: 'document',
        category: 'compliance',
        tags: ['privacy', 'gdpr'],
        estimatedMinutes: 30,
    },
    {
        title: 'New Hire Onboarding — Week 1 Checklist',
        description:
            'Day-by-day onboarding plan for first week: tools setup, shadowing, first-tickets, mentor pairing.',
        url: 'https://docs.google.com/document/d/example-onboarding-checklist',
        type: 'document',
        category: 'onboarding',
        tags: ['week-1', 'checklist'],
        estimatedMinutes: 20,
    },
];

export async function seedTrainingResources(force = false) {
    const count = await TrainingResource.countDocuments({});
    if (count > 0 && !force) {
        logger.info(`[seed:training-resources] skipping — ${count} resources already exist`);
        return { inserted: 0, skipped: true };
    }
    if (force) {
        await TrainingResource.deleteMany({});
        logger.info('[seed:training-resources] cleared existing resources');
    }

    const docs = DEFAULT_RESOURCES.map((r) => ({
        ...r,
        addedBy: SEED_PLACEHOLDER_USER_ID,
        addedByName: 'System',
        viewCount: 0,
        isActive: true,
    }));
    const inserted = await TrainingResource.insertMany(docs);
    logger.info(`[seed:training-resources] inserted ${inserted.length} default resources`);
    return { inserted: inserted.length, skipped: false };
}
