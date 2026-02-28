import { Document } from 'mongoose';

export enum ROIMetricType {
    FINANCIAL = 'financial',
    SKILL_DEVELOPMENT = 'skill_development',
    ATTENDANCE = 'attendance',
    ENGAGEMENT = 'engagement',
    SOCIAL_EMOTIONAL = 'social_emotional',
    HEALTH_FITNESS = 'health_fitness'
}

export enum ComparisonPeriod {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly',
    CUSTOM = 'custom'
}

export interface IParentROIDashboard extends Document {
    // Basic Information
    dashboardId: string;
    familyId: string;
    childId: string;
    childName: string;

    // Financial ROI
    financialMetrics: {
        totalInvestment: number;
        currency: string;
        investmentBreakdown: {
            tuitionFees: number;
            registrationFees: number;
            equipmentCosts: number;
            eventFees: number;
            otherCosts: number;
        };
        valueReceived: {
            classesAttended: number;
            pricePerClass: number;
            totalClassValue: number;
            additionalBenefits: {
                name: string;
                estimatedValue: number;
            }[];
        };
        costPerSession: number;
        costPerSkillLearned: number;
        savingsFromDiscounts: number;
        projectedAnnualCost: number;
    };

    // Skill Development ROI
    skillDevelopmentMetrics: {
        totalSkillsLearned: number;
        skillsInProgress: number;
        skillsMastered: number;
        skillProgressionRate: number; // skills per month
        skillCategories: {
            category: string;
            skillsLearned: number;
            progressRate: number;
        }[];
        milestonesAchieved: number;
        certificationsEarned: number;
        averageSkillLevel: string;
        skillDevelopmentScore: number; // 0-100
    };

    // Attendance Consistency
    attendanceMetrics: {
        totalSessionsScheduled: number;
        totalSessionsAttended: number;
        attendanceRate: number;
        consistencyScore: number; // 0-100
        currentStreak: number;
        longestStreak: number;
        missedSessions: number;
        makeUpSessionsUsed: number;
        punctualityRate: number;
        monthlyAttendance: {
            month: string;
            year: number;
            scheduled: number;
            attended: number;
            rate: number;
        }[];
    };

    // Engagement Metrics
    engagementMetrics: {
        participationScore: number; // 0-100
        enthusiasmRating: number; // 1-5
        focusRating: number; // 1-5
        effortRating: number; // 1-5
        positiveInteractions: number;
        leadershipMoments: number;
        peerCollaboration: number;
        coachFeedbackScore: number; // 0-100
        parentSatisfactionScore: number; // 0-100
    };

    // Social & Emotional Development
    socialEmotionalMetrics: {
        confidenceLevel: number; // 1-5
        teamworkSkills: number; // 1-5
        communicationSkills: number; // 1-5
        problemSolvingSkills: number; // 1-5
        resilienceScore: number; // 1-5
        friendshipsDeveloped: number;
        conflictResolutionInstances: number;
        emotionalRegulationScore: number; // 1-5
    };

    // Health & Fitness Progress
    healthFitnessMetrics: {
        physicalActivityHours: number;
        strengthImprovement: number; // percentage
        flexibilityImprovement: number; // percentage
        enduranceImprovement: number; // percentage
        coordinationImprovement: number; // percentage
        injuryFreeStreak: number; // days
        healthScreeningsPassed: number;
        fitnessGoalsAchieved: number;
    };

    // Comparative Analytics
    comparativeMetrics: {
        ageGroupComparison: {
            metric: string;
            childValue: number;
            ageGroupAverage: number;
            percentile: number;
        }[];
        programComparison: {
            metric: string;
            childValue: number;
            programAverage: number;
            ranking: number;
        }[];
        historicalComparison: {
            metric: string;
            currentValue: number;
            previousValue: number;
            changePercentage: number;
            trend: 'improving' | 'stable' | 'declining';
        }[];
    };

    // Value Proposition
    valueProposition: {
        overallROIScore: number; // 0-100
        valueForMoney: number; // 0-100
        developmentVelocity: number; // 0-100
        engagementLevel: number; // 0-100
        parentSatisfaction: number; // 0-100
        recommendationLikelihood: number; // 0-10 (NPS)
        keyAchievements: string[];
        areasOfExcellence: string[];
        improvementOpportunities: string[];
    };

    // Progress Timeline
    progressTimeline: {
        date: Date;
        eventType: 'skill_learned' | 'milestone' | 'certification' | 'achievement' | 'feedback';
        title: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        evidenceUrl?: string;
    }[];

    // Goals & Targets
    goalsTracking: {
        goalId: string;
        goalName: string;
        targetDate: Date;
        currentProgress: number;
        targetProgress: number;
        status: 'on_track' | 'at_risk' | 'achieved' | 'missed';
        milestones: {
            name: string;
            completed: boolean;
            completedDate?: Date;
        }[];
    }[];

    // Reporting Period
    reportingPeriod: {
        startDate: Date;
        endDate: Date;
        periodType: ComparisonPeriod;
    };

    // Last Updated
    lastCalculated: Date;
    nextUpdateDue: Date;

    // Business Context
    businessUnitId: string;
    locationId: string;
    programIds: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IROIReport extends Document {
    // Report Information
    reportId: string;
    reportType: 'monthly' | 'quarterly' | 'annual' | 'custom';
    reportTitle: string;

    // Recipients
    familyId: string;
    childId: string;
    childName: string;
    parentName: string;
    parentEmail: string;

    // Report Period
    periodStart: Date;
    periodEnd: Date;

    // Executive Summary
    executiveSummary: {
        overallROIScore: number;
        keyHighlights: string[];
        majorAchievements: string[];
        investmentSummary: {
            totalSpent: number;
            valueReceived: number;
            roiPercentage: number;
        };
        progressSummary: {
            skillsLearned: number;
            attendanceRate: number;
            engagementScore: number;
        };
    };

    // Detailed Metrics
    detailedMetrics: {
        financial: any;
        skillDevelopment: any;
        attendance: any;
        engagement: any;
        socialEmotional: any;
        healthFitness: any;
    };

    // Visualizations
    visualizations: {
        chartType: string;
        chartData: any;
        chartTitle: string;
    }[];

    // Recommendations
    recommendations: {
        category: string;
        recommendation: string;
        priority: 'high' | 'medium' | 'low';
        actionItems: string[];
    }[];

    // Next Steps
    nextSteps: {
        step: string;
        dueDate: Date;
        assignedTo: string;
    }[];

    // Report Generation
    generatedDate: Date;
    generatedBy: string;
    reportUrl: string;
    reportFormat: 'pdf' | 'html' | 'email';

    // Delivery Status
    deliveryStatus: 'pending' | 'sent' | 'viewed' | 'downloaded';
    sentDate?: Date;
    viewedDate?: Date;
    downloadedDate?: Date;

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces

export interface ICalculateROIRequest {
    familyId: string;
    childId: string;
    periodStart: Date;
    periodEnd: Date;
}

export interface IGenerateReportRequest {
    familyId: string;
    childId: string;
    reportType: 'monthly' | 'quarterly' | 'annual' | 'custom';
    periodStart: Date;
    periodEnd: Date;
    includeComparisons: boolean;
    deliveryMethod: 'email' | 'download' | 'both';
}

export interface IROISummary {
    childId: string;
    childName: string;
    overallROIScore: number;
    financialROI: {
        totalInvestment: number;
        valueReceived: number;
        roiPercentage: number;
    };
    developmentROI: {
        skillsLearned: number;
        certificationsEarned: number;
        progressRate: number;
    };
    engagementROI: {
        attendanceRate: number;
        participationScore: number;
        satisfactionScore: number;
    };
    lastUpdated: Date;
}

export interface IComparisonData {
    metric: string;
    childValue: number;
    comparisonValue: number;
    comparisonType: 'age_group' | 'program' | 'location' | 'historical';
    percentile?: number;
    ranking?: number;
    trend?: 'improving' | 'stable' | 'declining';
}

export interface IProgressInsight {
    insightType: 'achievement' | 'improvement' | 'concern' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    suggestedActions?: string[];
    relatedMetrics: string[];
}

export interface IValueVisualization {
    visualizationType: 'line_chart' | 'bar_chart' | 'pie_chart' | 'gauge' | 'progress_bar';
    title: string;
    data: any;
    insights: string[];
}