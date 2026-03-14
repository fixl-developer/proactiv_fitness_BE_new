import mongoose, { Schema, Document } from 'mongoose';

export interface IPredictiveAnalytics extends Document {
    entityId: string;
    entityType: 'child' | 'class' | 'location' | 'coach';
    predictions: {
        skillProgression: number;
        attendanceRate: number;
        dropoutRisk: number;
        performanceTrend: string;
    };
    confidence: number;
    generatedAt: Date;
    validUntil: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMLModel extends Document {
    name: string;
    type: 'regression' | 'classification' | 'clustering' | 'timeseries';
    version: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingDataSize: number;
    lastTrainedAt: Date;
    status: 'active' | 'inactive' | 'training' | 'deprecated';
    createdAt: Date;
    updatedAt: Date;
}

export interface IAdvancedDashboard extends Document {
    userId: string;
    userRole: 'admin' | 'coach' | 'parent' | 'staff';
    dashboardType: 'performance' | 'financial' | 'operational' | 'predictive';
    widgets: {
        id: string;
        type: string;
        title: string;
        position: number;
        config: any;
    }[];
    filters: {
        dateRange: { start: Date; end: Date };
        locations?: string[];
        coaches?: string[];
        classes?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface IRealTimeInsight extends Document {
    type: 'alert' | 'opportunity' | 'trend' | 'anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    data: any;
    affectedEntities: string[];
    actionRequired: boolean;
    recommendedAction?: string;
    createdAt: Date;
    expiresAt: Date;
    updatedAt: Date;
}

export interface IAnomalyDetection extends Document {
    entityId: string;
    entityType: string;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    metrics: any;
    detectedAt: Date;
    resolved: boolean;
    resolution?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITrendAnalysis extends Document {
    metric: string;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    changePercentage: number;
    dataPoints: { date: Date; value: number }[];
    forecast: { date: Date; value: number }[];
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPerformanceMetric extends Document {
    entityId: string;
    entityType: string;
    metricName: string;
    value: number;
    unit: string;
    benchmark: number;
    percentile: number;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AdvancedAnalyticsSchema = new Schema({
    type: { type: String, enum: ['predictive', 'ml_model', 'dashboard', 'insight', 'anomaly', 'trend', 'metric'] },
    entityId: String,
    entityType: String,
    predictions: {
        skillProgression: Number,
        attendanceRate: Number,
        dropoutRisk: Number,
        performanceTrend: String
    },
    confidence: Number,
    generatedAt: Date,
    validUntil: Date,
    name: String,
    modelType: String,
    version: String,
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    trainingDataSize: Number,
    lastTrainedAt: Date,
    status: String,
    userId: String,
    userRole: String,
    dashboardType: String,
    widgets: [Schema.Types.Mixed],
    filters: {
        dateRange: {
            start: Date,
            end: Date
        },
        locations: [String],
        coaches: [String],
        classes: [String]
    },
    anomalyType: String,
    severity: String,
    title: String,
    description: String,
    data: Schema.Types.Mixed,
    affectedEntities: [String],
    actionRequired: Boolean,
    recommendedAction: String,
    expiresAt: Date,
    resolved: Boolean,
    resolution: String,
    metric: String,
    period: String,
    trend: String,
    changePercentage: Number,
    dataPoints: [Schema.Types.Mixed],
    forecast: [Schema.Types.Mixed],
    metricName: String,
    value: Number,
    unit: String,
    benchmark: Number,
    percentile: Number,
    timestamp: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const AdvancedAnalyticsModel = mongoose.model('AdvancedAnalytics', AdvancedAnalyticsSchema);
