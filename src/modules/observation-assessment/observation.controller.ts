import { ObservationService } from './observation.service';

export class ObservationController {
    private service: ObservationService;

    constructor() {
        this.service = new ObservationService();
    }

    async createSkillAssessment(req: any, res: any): Promise<void> {
        try {
            const assessment = await this.service.createSkillAssessment(req.body);
            res.status(201).json({ success: true, data: assessment });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateAssessment(req: any, res: any): Promise<void> {
        try {
            const { assessmentId } = req.params;
            const assessment = await this.service.updateAssessment(assessmentId, req.body);
            res.status(200).json({ success: true, data: assessment });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getStudentAssessments(req: any, res: any): Promise<void> {
        try {
            const { studentId } = req.params;
            const assessments = await this.service.getStudentAssessments(studentId);
            res.status(200).json({ success: true, data: assessments });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async createProgressTracking(req: any, res: any): Promise<void> {
        try {
            const progress = await this.service.createProgressTracking(req.body);
            res.status(201).json({ success: true, data: progress });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateProgress(req: any, res: any): Promise<void> {
        try {
            const { progressId } = req.params;
            const { completionPercentage } = req.body;
            const progress = await this.service.updateProgress(progressId, completionPercentage);
            res.status(200).json({ success: true, data: progress });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async generatePerformanceAnalytics(req: any, res: any): Promise<void> {
        try {
            const analytics = await this.service.generatePerformanceAnalytics(req.body);
            res.status(201).json({ success: true, data: analytics });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async recordBehavior(req: any, res: any): Promise<void> {
        try {
            const behavior = await this.service.recordBehavior(req.body);
            res.status(201).json({ success: true, data: behavior });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async generateReport(req: any, res: any): Promise<void> {
        try {
            const report = await this.service.generateReport(req.body);
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async finalizeReport(req: any, res: any): Promise<void> {
        try {
            const { reportId } = req.params;
            const report = await this.service.finalizeReport(reportId);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async sendReportToParent(req: any, res: any): Promise<void> {
        try {
            const { reportId } = req.params;
            const { parentId } = req.body;
            const report = await this.service.sendReportToParent(reportId, parentId);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async createTemplate(req: any, res: any): Promise<void> {
        try {
            const template = await this.service.createTemplate(req.body);
            res.status(201).json({ success: true, data: template });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async createPortfolio(req: any, res: any): Promise<void> {
        try {
            const portfolio = await this.service.createPortfolio(req.body);
            res.status(201).json({ success: true, data: portfolio });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async sendParentNotification(req: any, res: any): Promise<void> {
        try {
            const notification = await this.service.sendParentNotification(req.body);
            res.status(201).json({ success: true, data: notification });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async scheduleAssessment(req: any, res: any): Promise<void> {
        try {
            const schedule = await this.service.scheduleAssessment(req.body);
            res.status(201).json({ success: true, data: schedule });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }
}
