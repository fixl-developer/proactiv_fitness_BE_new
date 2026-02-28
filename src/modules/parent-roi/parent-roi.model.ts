import mongoose, { Schema } from 'mongoose';
import { IParentROIDashboard, IROIReport, ROIMetricType, ComparisonPeriod } from './parent-roi.interface';

const ParentROIDashboardSchema = new Schema<IParentROIDashboard>(
    {
        dashboardId: { type: String, required: true, unique: true },
        familyId: { type: String, required: true, index: true },
        childId: { type: String, required: true, index: true },
        childName: { type: String, required: true },

        financialMetrics: {
            totalInvestment: { type: Number, required: true, default: 0 },
            currency: { type: String, default: 'USD' },
            investmentBreakdown: {
                tuitionFees: { type: Number, default: 0 },
                registrationFees: { type: Number, default: 0 },
                equipmentCosts: { type: Number, default: 0 },
                eventFees: { type: Number, default: 0 },
                otherCosts: { type: Number, default: 0 }
            },
            valueReceived: {
                classesAttended: { type: Number, default: 0 },
                pricePerClass: { type: Number, default: 0 },
                totalClassValue: { type: Number, default: 0 },
                additionalBenefits: [{
                    name: String,
                    estimatedValue: Number
                }]
            },
            costPerSession: { type: Number, default: 0 },
            costPerSkillLearned: { type: Number, default: 0 },
            savingsFromDiscounts: { type: Number, default: 0 },
            projectedAnnualCost: { type: Number, default: 0 }
        },

        skillDevelopmentMetrics: {
            totalSkillsLearned: { type: Number, default: 0 },
            skillsInProgress: { type: Number, default: 0 },
            skillsMastered: { type: Number, default: 0 },
            skillProgressionRate: { type: Number, default: 0 },
            skillCategories: [{
                category: String,
                skillsLearned: Number,
                progressRate: Number
            }],
            milestonesAchieved: { type: Number, default: 0 },
            certificationsEarned: { type: Number, default: 0 },
            averageSkillLevel: { type: String, default: 'beginner' },
            skillDevelopmentScore: { type: Number, default: 0, min: 0, max: 100 }
        },

        attendanceMetrics: {
            totalSessionsScheduled: { type: Number, default: 0 },
            totalSessionsAttended: { type: Number, default: 0 },
            attendanceRate: { type: Number, default: 0 },
            consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
            currentStreak: { type: Number, default: 0 },
            longestStreak: { type: Number, default: 0 },
            missedSessions: { type: Number, default: 0 },
            makeUpSessionsUsed: { type: Number, default: 0 },
            punctualityRate: { type: Number, default: 0 },
            monthlyAttendance: [{
                month: String,
                year: Number,
                scheduled: Number,
                attended: Number,
                rate: Number
            }]
        },

        engagementMetrics: {
            participationScore: { type: Number, default: 0, min: 0, max: 100 },
            enthusiasmRating: { type: Number, default: 0, min: 1, max: 5 },
            focusRating: { type: Number, default: 0, min: 1, max: 5 },
            effortRating: { type: Number, default: 0, min: 1, max: 5 },
            positiveInteractions: { type: Number, default: 0 },
            leadershipMoments: { type: Number, default: 0 },
            peerCollaboration: { type: Number, default: 0 },
            coachFeedbackScore: { type: Number, default: 0, min: 0, max: 100 },
            parentSatisfactionScore: { type: Number, default: 0, min: 0, max: 100 }
        },

        socialEmotionalMetrics: {
            confidenceLevel: { type: Number, default: 0, min: 1, max: 5 },
            teamworkSkills: { type: Number, default: 0, min: 1, max: 5 },
            communicationSkills: { type: Number, default: 0, min: 1, max: 5 },
            problemSolvingSkills: { type: Number, default: 0, min: 1, max: 5 },
            resilienceScore: { type: Number, default: 0, min: 1, max: 5 },
            friendshipsDeveloped: { type: Number, default: 0 },
            conflictResolutionInstances: { type: Number, default: 0 },
            emotionalRegulationScore: { type: Number, default: 0, min: 1, max: 5 }
        },

        healthFitnessMetrics: {
            physicalActivityHours: { type: Number, default: 0 },
            strengthImprovement: { type: Number, default: 0 },
            flexibilityImprovement: { type: Number, default: 0 },
            enduranceImprovement: { type: Number, default: 0 },
            coordinationImprovement: { type: Number, default: 0 },
            injuryFreeStreak: { type: Number, default: 0 },
            healthScreeningsPassed: { type: Number, default: 0 },
            fitnessGoalsAchieved: { type: Number, default: 0 }
        },

        comparativeMetrics: {
            ageGroupComparison: [{
                metric: String,
                childValue: Number,
                ageGroupAverage: Number,
                percentile: Number
            }],
            programComparison: [{
                metric: String,
                childValue: Number,
                programAverage: Number,
                ranking: Number
            }],
            historicalComparison: [{
                metric: String,
                currentValue: Number,
                previousValue: Number,
                changePercentage: Number,
                trend: { type: String, enum: ['improving', 'stable', 'declining'] }
            }]
        },

        valueProposition: {
            overallROIScore: { type: Number, default: 0, min: 0, max: 100 },
            valueForMoney: { type: Number, default: 0, min: 0, max: 100 },
            developmentVelocity: { type: Number, default: 0, min: 0, max: 100 },
            engagementLevel: { type: Number, default: 0, min: 0, max: 100 },
            parentSatisfaction: { type: Number, default: 0, min: 0, max: 100 },
            recommendationLikelihood: { type: Number, default: 0, min: 0, max: 10 },
            keyAchievements: [String],
            areasOfExcellence: [String],
            improvementOpportunities: [String]
        },

        progressTimeline: [{
            date: Date,
            eventType: { type: String, enum: ['skill_learned', 'milestone', 'certification', 'achievement', 'feedback'] },
            title: String,
            description: String,
            impact: { type: String, enum: ['high', 'medium', 'low'] },
            evidenceUrl: String
        }],

        goalsTracking: [{
            goalId: String,
            goalName: String,
            targetDate: Date,
            currentProgress: Number,
            targetProgress: Number,
            status: { type: String, enum: ['on_track', 'at_risk', 'achieved', 'missed'] },
            milestones: [{
                name: String,
                completed: Boolean,
                completedDate: Date
            }]
        }],

        reportingPeriod: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            periodType: { type: String, enum: Object.values(ComparisonPeriod), required: true }
        },

        lastCalculated: { type: Date, default: Date.now },
        nextUpdateDue: { type: Date, required: true },

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        programIds: [{ type: String }],

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'parent_roi_dashboards'
    }
);

// Indexes
ParentROIDashboardSchema.index({ familyId: 1, childId: 1 });
ParentROIDashboardSchema.index({ businessUnitId: 1, locationId: 1 });
ParentROIDashboardSchema.index({ 'reportingPeriod.startDate': 1, 'reportingPeriod.endDate': 1 });

const ROIReportSchema = new Schema<IROIReport>(
    {
        reportId: { type: String, required: true, unique: true },
        reportType: { type: String, enum: ['monthly', 'quarterly', 'annual', 'custom'], required: true },
        reportTitle: { type: String, required: true },

        familyId: { type: String, required: true, index: true },
        childId: { type: String, required: true, index: true },
        childName: { type: String, required: true },
        parentName: { type: String, required: true },
        parentEmail: { type: String, required: true },

        periodStart: { type: Date, required: true },
        periodEnd: { type: Date, required: true },

        executiveSummary: {
            overallROIScore: { type: Number, required: true },
            keyHighlights: [String],
            majorAchievements: [String],
            investmentSummary: {
                totalSpent: Number,
                valueReceived: Number,
                roiPercentage: Number
            },
            progressSummary: {
                skillsLearned: Number,
                attendanceRate: Number,
                engagementScore: Number
            }
        },

        detailedMetrics: {
            financial: Schema.Types.Mixed,
            skillDevelopment: Schema.Types.Mixed,
            attendance: Schema.Types.Mixed,
            engagement: Schema.Types.Mixed,
            socialEmotional: Schema.Types.Mixed,
            healthFitness: Schema.Types.Mixed
        },

        visualizations: [{
            chartType: String,
            chartData: Schema.Types.Mixed,
            chartTitle: String
        }],

        recommendations: [{
            category: String,
            recommendation: String,
            priority: { type: String, enum: ['high', 'medium', 'low'] },
            actionItems: [String]
        }],

        nextSteps: [{
            step: String,
            dueDate: Date,
            assignedTo: String
        }],

        generatedDate: { type: Date, default: Date.now },
        generatedBy: { type: String, required: true },
        reportUrl: { type: String },
        reportFormat: { type: String, enum: ['pdf', 'html', 'email'], required: true },

        deliveryStatus: { type: String, enum: ['pending', 'sent', 'viewed', 'downloaded'], default: 'pending' },
        sentDate: Date,
        viewedDate: Date,
        downloadedDate: Date,

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'roi_reports'
    }
);

// Indexes
ROIReportSchema.index({ familyId: 1, childId: 1, reportType: 1 });
ROIReportSchema.index({ periodStart: 1, periodEnd: 1 });
ROIReportSchema.index({ deliveryStatus: 1 });

export const ParentROIDashboard = mongoose.model<IParentROIDashboard>('ParentROIDashboard', ParentROIDashboardSchema);
export const ROIReport = mongoose.model<IROIReport>('ROIReport', ROIReportSchema);
