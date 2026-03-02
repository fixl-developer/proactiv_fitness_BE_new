import mongoose, { Schema } from 'mongoose';
import { IReport, IReportExecution, IDashboard, IProjection } from './reporting.interface';

const ReportSchema = new Schema<IReport>({
    reportId: { type: String, required: true, unique: true, index: true },
    reportType: {
        type: String,
        required: true,
        enum: ['financial', 'operations', 'attendance', 'performance', 'custom']
    },
    reportName: { type: String, required: true },
    description: { type: String },
    config: {
        dataSource: [{ type: String }],
        filters: { type: Schema.Types.Mixed },
        groupBy: [{ type: String }],
        aggregations: { type: Schema.Types.Mixed },
        dateRange: {
            from: { type: Date, required: true },
            to: { type: Date, required: true }
        }
    },
    schedule: {
        isScheduled: { type: Boolean, default: false },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'] },
        nextRun: { type: Date },
        lastRun: { type: Date },
        recipients: [{ type: String }]
    },
    format: { type: String, enum: ['pdf', 'excel', 'csv', 'json'], default: 'pdf' },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    businessUnitId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ReportExecutionSchema = new Schema<IReportExecution>({
    executionId: { type: String, required: true, unique: true, index: true },
    reportId: { type: String, required: true, index: true },
    reportName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    progress: {
        percentage: { type: Number, default: 0 },
        currentStep: { type: String, default: 'Initializing' }
    },
    result: {
        fileUrl: { type: String },
        fileSize: { type: Number },
        recordCount: { type: Number },
        generatedAt: { type: Date }
    },
    error: { type: String },
    executedBy: { type: String, required: true },
    executedAt: { type: Date, default: Date.now }
});

const DashboardSchema = new Schema<IDashboard>({
    dashboardId: { type: String, required: true, unique: true, index: true },
    dashboardName: { type: String, required: true },
    description: { type: String },
    widgets: [{
        widgetId: { type: String, required: true },
        widgetType: { type: String, enum: ['chart', 'table', 'metric', 'gauge'], required: true },
        title: { type: String, required: true },
        dataSource: { type: String, required: true },
        config: { type: Schema.Types.Mixed },
        position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true }
        }
    }],
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    businessUnitId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ProjectionSchema = new Schema<IProjection>({
    projectionId: { type: String, required: true, unique: true, index: true },
    projectionName: { type: String, required: true },
    sourceCollection: { type: String, required: true },
    targetCollection: { type: String, required: true },
    transformations: [{
        field: { type: String, required: true },
        operation: { type: String, required: true },
        params: { type: Schema.Types.Mixed }
    }],
    schedule: {
        frequency: { type: String, enum: ['realtime', 'hourly', 'daily', 'weekly'], required: true },
        lastRun: { type: Date },
        nextRun: { type: Date }
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);
export const ReportExecution = mongoose.model<IReportExecution>('ReportExecution', ReportExecutionSchema);
export const Dashboard = mongoose.model<IDashboard>('Dashboard', DashboardSchema);
export const Projection = mongoose.model<IProjection>('Projection', ProjectionSchema);
