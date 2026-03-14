import { ObservationService } from './observation.service';

describe('Observation & Assessment', () => {
    let service: ObservationService;

    beforeEach(() => {
        service = new ObservationService();
    });

    it('should create skill assessment', async () => {
        const result = await service.createSkillAssessment({
            centerId: 'center-1',
            studentId: 'student-1',
            skillId: 'skill-1',
            skillName: 'Balance',
            assessor: 'coach-1',
            score: 85,
            maxScore: 100,
            level: 'intermediate'
        });
        expect(result.assessmentId).toBeDefined();
        expect(result.percentage).toBe(85);
    });

    it('should create progress tracking', async () => {
        const result = await service.createProgressTracking({
            centerId: 'center-1',
            studentId: 'student-1',
            programId: 'prog-1',
            startDate: new Date(),
            currentLevel: 'beginner',
            targetLevel: 'intermediate'
        });
        expect(result.progressId).toBeDefined();
        expect(result.status).toBe('active');
    });

    it('should generate performance analytics', async () => {
        const result = await service.generatePerformanceAnalytics({
            centerId: 'center-1',
            studentId: 'student-1',
            period: 'monthly'
        });
        expect(result.analyticsId).toBeDefined();
    });

    it('should record behavior', async () => {
        const result = await service.recordBehavior({
            centerId: 'center-1',
            studentId: 'student-1',
            behavior: 'positive',
            category: 'cooperation',
            description: 'Great teamwork',
            recordedBy: 'coach-1'
        });
        expect(result.behaviorId).toBeDefined();
    });

    it('should generate report', async () => {
        const result = await service.generateReport({
            centerId: 'center-1',
            studentId: 'student-1',
            reportType: 'progress',
            period: 'monthly'
        });
        expect(result.reportId).toBeDefined();
        expect(result.status).toBe('draft');
    });

    it('should create assessment template', async () => {
        const result = await service.createTemplate({
            centerId: 'center-1',
            templateName: 'Gymnastics Assessment',
            programId: 'prog-1',
            skills: [],
            maxScore: 100
        });
        expect(result.templateId).toBeDefined();
    });

    it('should create student portfolio', async () => {
        const result = await service.createPortfolio({
            centerId: 'center-1',
            studentId: 'student-1'
        });
        expect(result.portfolioId).toBeDefined();
    });

    it('should send parent notification', async () => {
        const result = await service.sendParentNotification({
            centerId: 'center-1',
            parentId: 'parent-1',
            studentId: 'student-1',
            type: 'progress',
            title: 'Progress Update',
            message: 'Great progress this week'
        });
        expect(result.notificationId).toBeDefined();
        expect(result.isRead).toBe(false);
    });

    it('should schedule assessment', async () => {
        const result = await service.scheduleAssessment({
            centerId: 'center-1',
            programId: 'prog-1',
            assessmentType: 'skill',
            frequency: 'monthly',
            nextScheduledDate: new Date()
        });
        expect(result.scheduleId).toBeDefined();
    });
});
