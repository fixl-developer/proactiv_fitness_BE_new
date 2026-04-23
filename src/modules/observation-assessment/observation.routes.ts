import { ObservationController } from './observation.controller';

export class ObservationRoutes {
    private controller: ObservationController;

    constructor() {
        this.controller = new ObservationController();
    }

    public getRoutes() {
        return [
            { method: 'POST', path: '/api/observation/assessments', handler: (req: any, res: any) => this.controller.createSkillAssessment(req, res) },
            { method: 'PUT', path: '/api/observation/assessments/:assessmentId', handler: (req: any, res: any) => this.controller.updateAssessment(req, res) },
            { method: 'GET', path: '/api/observation/students/:studentId/assessments', handler: (req: any, res: any) => this.controller.getStudentAssessments(req, res) },
            { method: 'POST', path: '/api/observation/progress', handler: (req: any, res: any) => this.controller.createProgressTracking(req, res) },
            { method: 'PUT', path: '/api/observation/progress/:progressId', handler: (req: any, res: any) => this.controller.updateProgress(req, res) },
            { method: 'POST', path: '/api/observation/analytics', handler: (req: any, res: any) => this.controller.generatePerformanceAnalytics(req, res) },
            { method: 'POST', path: '/api/observation/behavior', handler: (req: any, res: any) => this.controller.recordBehavior(req, res) },
            { method: 'POST', path: '/api/observation/reports', handler: (req: any, res: any) => this.controller.generateReport(req, res) },
            { method: 'PUT', path: '/api/observation/reports/:reportId/finalize', handler: (req: any, res: any) => this.controller.finalizeReport(req, res) },
            { method: 'POST', path: '/api/observation/reports/:reportId/send', handler: (req: any, res: any) => this.controller.sendReportToParent(req, res) },
            { method: 'POST', path: '/api/observation/templates', handler: (req: any, res: any) => this.controller.createTemplate(req, res) },
            { method: 'POST', path: '/api/observation/portfolio', handler: (req: any, res: any) => this.controller.createPortfolio(req, res) },
            { method: 'POST', path: '/api/observation/notifications', handler: (req: any, res: any) => this.controller.sendParentNotification(req, res) },
            { method: 'POST', path: '/api/observation/schedule', handler: (req: any, res: any) => this.controller.scheduleAssessment(req, res) }
        ];
    }
}
