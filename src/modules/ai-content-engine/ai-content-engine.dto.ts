export class GenerateSocialPostDTO {
    tenantId: string;
    topic: string;
    targetAudience: string;
    tone?: string;
    platform?: string;
}

export class GenerateEmailDTO {
    tenantId: string;
    topic: string;
    targetAudience: string;
    tone?: string;
    campaignType?: string;
}

export class GenerateArticleDTO {
    tenantId: string;
    topic: string;
    targetAudience: string;
    tone?: string;
    wordCount?: number;
}

export class GenerateAdCopyDTO {
    tenantId: string;
    topic: string;
    targetAudience: string;
    tone?: string;
    adPlatform?: string;
    budget?: string;
}

export class SeoSuggestionsRequestDTO {
    pageId: string;
    tenantId: string;
}

export class ContentResponseDTO {
    contentId: string;
    title: string;
    body: string;
    hashtags: string[];
    callToAction: string;
    mediaSuggestions: string[];
    status: string;
    generatedAt: Date;
    aiPowered: boolean;
}

export class SeoResponseDTO {
    contentId: string;
    pageId: string;
    keywords: string[];
    metaDescription: string;
    headings: string[];
    suggestions: string[];
    competitorKeywords: string[];
    contentGaps: string[];
    technicalSeoTips: string[];
    overallScore: number;
    analyzedAt: Date;
    aiPowered: boolean;
}
