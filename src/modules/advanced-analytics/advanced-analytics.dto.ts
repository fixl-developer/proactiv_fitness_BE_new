export interface GetPredictiveAnalyticsDTO {
    entityId: string;
    entityType: 'child' | 'class' | 'location' | 'coach';
}

export interface CreateMLModelDTO {
    name: string;
    type: 'regression' | 'classification' | 'clustering' | 'timeseries';
    version: string;
    trainingDataSize: number;
}

export interface UpdateMLModelDTO {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    status?: 'active' | 'inactive' | 'training' | 'deprecated';
}

export interface CreateAdvancedDashboardDTO {
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
    filters?: {
        dateRange: { start: Date; end: Date };
        locations?: string[];
        coaches?: string[];
        classes?: string[];
    };
}

export interface UpdateDashboardDTO {
    widgets?: {
        id: string;
        type: string;
        title: string;
        position: number;
        config: any;
    }[];
    filters?: {
        dateRange: { start: Date; end: Date };
        locations?: string[];
        coaches?: string[];
        classes?: string[];
    };
}

export interface GetRealTimeInsightsDTO {
    type?: 'alert' | 'opportunity' | 'trend' | 'anomaly';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    limit?: number;
}

export interface CreateAnomalyDetectionDTO {
    entityId: string;
    entityType: string;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    metrics: any;
}

export interface ResolvAnomalyDTO {
    resolution: string;
}

export interface GetTrendAnalysisDTO {
    metric: string;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
    startDate: Date;
    endDate: Date;
}

export interface CreatePerformanceMetricDTO {
    entityId: string;
    entityType: string;
    metricName: string;
    value: number;
    unit: string;
    benchmark: number;
}

export interface GetAnalyticsReportDTO {
    reportType: 'summary' | 'detailed' | 'executive';
    dateRange: { start: Date; end: Date };
    filters?: {
        locations?: string[];
        coaches?: string[];
        classes?: string[];
    };
}
