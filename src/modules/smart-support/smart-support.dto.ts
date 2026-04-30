export class ClassifyTicketDTO {
    tenantId: string;
    ticketRef?: string;
    subject: string;
    message: string;
    memberHistory?: Record<string, any>;
}

export class RouteTicketDTO {
    tenantId: string;
    ticketRef: string;
    category?: string;
    priority?: string;
    subject: string;
    message: string;
    availableAgents?: Array<{ agentId: string; name: string; specialties: string[] }>;
}

export class AnalyzeSentimentDTO {
    tenantId: string;
    ticketRef?: string;
    message: string;
}

export class AutoResolveDTO {
    tenantId: string;
    ticketRef?: string;
    subject: string;
    message: string;
    category?: string;
}

export class ClassificationResponseDTO {
    supportId: string;
    ticketRef: string;
    classification: {
        category: string;
        priority: string;
        confidence: number;
    };
    reasoning: string;
    suggestedTags: string[];
    escalationNeeded: boolean;
    classifiedAt: Date;
    aiPowered: boolean;
}

export class RoutingResponseDTO {
    ticketRef: string;
    routing: {
        assignedAgentId: string;
        routingReason: string;
        alternativeAgents: string[];
    };
    estimatedResponseTime: string;
    specialInstructions: string;
    routedAt: Date;
    aiPowered: boolean;
}

export class SentimentResponseDTO {
    ticketRef: string;
    sentiment: {
        score: number;
        label: string;
        keyPhrases: string[];
    };
    emotionalTone: string;
    urgencyIndicators: string[];
    customerSatisfactionEstimate: number;
    analyzedAt: Date;
    aiPowered: boolean;
}

export class AutoResolveResponseDTO {
    ticketRef: string;
    autoResolution: {
        resolved: boolean;
        resolution: string;
        confidence: number;
    };
    resolutionType: string;
    requiresHumanReview: boolean;
    resolvedAt: Date | null;
    aiPowered: boolean;
}
