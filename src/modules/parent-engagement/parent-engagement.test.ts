import { ParentEngagementService } from './parent-engagement.service';

describe('ParentEngagementService', () => {
    let service: ParentEngagementService;

    beforeEach(() => {
        service = new ParentEngagementService();
    });

    describe('generateProgressVideo', () => {
        it('should generate a progress video', async () => {
            const video = await service.generateProgressVideo('child123', 'weekly', true, true);
            expect(video).toBeDefined();
            expect(video.childId).toBe('child123');
            expect(video.period).toBe('weekly');
        });
    });

    describe('createMilestone', () => {
        it('should create a milestone', async () => {
            const milestone = await service.createMilestone({
                childId: 'child123',
                parentId: 'parent123',
                title: 'First Cartwheel',
                description: 'Successfully completed first cartwheel',
                category: 'skill'
            });
            expect(milestone).toBeDefined();
            expect(milestone.title).toBe('First Cartwheel');
        });
    });

    describe('createEducationContent', () => {
        it('should create education content', async () => {
            const content = await service.createEducationContent({
                title: 'How to Support Your Child',
                description: 'Tips for parents',
                content: 'Content here',
                category: 'parenting'
            });
            expect(content).toBeDefined();
            expect(content.title).toBe('How to Support Your Child');
        });
    });

    describe('createProgressReport', () => {
        it('should create a progress report', async () => {
            const report = await service.createProgressReport({
                childId: 'child123',
                childName: 'John',
                parentId: 'parent123',
                parentEmail: 'parent@example.com',
                period: 'monthly',
                attendanceRate: 95,
                skillsProgress: [],
                engagementScore: 85,
                recommendations: ['Keep practicing']
            });
            expect(report).toBeDefined();
            expect(report.childName).toBe('John');
        });
    });

    describe('scheduleWorkshop', () => {
        it('should schedule a workshop', async () => {
            const workshop = await service.scheduleWorkshop({
                title: 'Gymnastics Basics',
                description: 'Learn the basics',
                scheduledDate: new Date(),
                duration: 60,
                instructor: 'Coach John',
                topic: 'basics',
                maxCapacity: 30
            });
            expect(workshop).toBeDefined();
            expect(workshop.title).toBe('Gymnastics Basics');
        });
    });

    describe('collectFeedback', () => {
        it('should collect feedback', async () => {
            const feedback = await service.collectFeedback({
                parentId: 'parent123',
                childId: 'child123',
                rating: 5,
                comment: 'Great experience',
                category: 'overall'
            });
            expect(feedback).toBeDefined();
            expect(feedback.rating).toBe(5);
        });
    });
});
