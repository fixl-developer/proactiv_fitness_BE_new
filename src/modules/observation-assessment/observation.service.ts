import {
    ISkillAssessment, IProgressTracking, IPerformanceAnalytics, IBehavioralTracking,
    IReportGeneration, IAssessmentTemplate, IStudentPortfolio, IParentNotification,
    IAssessmentSchedule,
    SkillAssessment, ProgressTracking, PerformanceAnalytics, BehavioralTracking,
    ReportGeneration, AssessmentTemplate, StudentPortfolio, ParentNotification,
    AssessmentSchedule
} from './observation.model';

export class ObservationService {
    // ==================== SKILL ASSESSMENT ====================

    async createSkillAssessment(assessmentData: Partial<ISkillAssessment>): Promise<ISkillAssessment> {
        try {
            const score = assessmentData.score || 0;
            const maxScore = assessmentData.maxScore || 100;
            const assessment = new SkillAssessment({
                assessmentId: `ASSESS-${Date.now()}`,
                ...assessmentData,
                percentage: (score / maxScore) * 100,
                status: 'completed',
            });
            return await assessment.save();
        } catch (error) {
            throw new Error(`Failed to create skill assessment: ${(error as Error).message}`);
        }
    }

    async updateAssessment(assessmentId: string, updates: Partial<ISkillAssessment>): Promise<ISkillAssessment> {
        try {
            if (updates.score !== undefined || updates.maxScore !== undefined) {
                const existing = await SkillAssessment.findOne({ assessmentId });
                const score = updates.score ?? existing?.score ?? 0;
                const maxScore = updates.maxScore ?? existing?.maxScore ?? 100;
                updates.percentage = (score / maxScore) * 100;
            }
            const assessment = await SkillAssessment.findOneAndUpdate(
                { assessmentId },
                { $set: updates },
                { new: true, runValidators: true }
            );
            if (!assessment) {
                throw new Error(`Assessment with id ${assessmentId} not found`);
            }
            return assessment;
        } catch (error) {
            throw new Error(`Failed to update assessment: ${(error as Error).message}`);
        }
    }

    async getStudentAssessments(studentId: string): Promise<ISkillAssessment[]> {
        try {
            return await SkillAssessment.find({ studentId }).sort({ assessmentDate: -1 });
        } catch (error) {
            throw new Error(`Failed to get student assessments: ${(error as Error).message}`);
        }
    }

    async getAssessmentsBySkill(skillId: string, centerId: string): Promise<ISkillAssessment[]> {
        try {
            return await SkillAssessment.find({ skillId, centerId }).sort({ assessmentDate: -1 });
        } catch (error) {
            throw new Error(`Failed to get assessments by skill: ${(error as Error).message}`);
        }
    }

    // ==================== PROGRESS TRACKING ====================

    async createProgressTracking(progressData: Partial<IProgressTracking>): Promise<IProgressTracking> {
        try {
            const progress = new ProgressTracking({
                progressId: `PROG-${Date.now()}`,
                ...progressData,
                completionPercentage: 0,
                status: 'active',
            });
            return await progress.save();
        } catch (error) {
            throw new Error(`Failed to create progress tracking: ${(error as Error).message}`);
        }
    }

    async updateProgress(progressId: string, completionPercentage: number): Promise<IProgressTracking> {
        try {
            const status = completionPercentage === 100 ? 'completed' : 'active';
            const progress = await ProgressTracking.findOneAndUpdate(
                { progressId },
                { $set: { completionPercentage, status } },
                { new: true, runValidators: true }
            );
            if (!progress) {
                throw new Error(`Progress with id ${progressId} not found`);
            }
            return progress;
        } catch (error) {
            throw new Error(`Failed to update progress: ${(error as Error).message}`);
        }
    }

    async getStudentProgress(studentId: string): Promise<IProgressTracking[]> {
        try {
            return await ProgressTracking.find({ studentId }).sort({ startDate: -1 });
        } catch (error) {
            throw new Error(`Failed to get student progress: ${(error as Error).message}`);
        }
    }

    async addMilestone(progressId: string, milestone: any): Promise<IProgressTracking> {
        try {
            const progress = await ProgressTracking.findOneAndUpdate(
                { progressId },
                { $push: { milestones: milestone } },
                { new: true, runValidators: true }
            );
            if (!progress) {
                throw new Error(`Progress with id ${progressId} not found`);
            }
            return progress;
        } catch (error) {
            throw new Error(`Failed to add milestone: ${(error as Error).message}`);
        }
    }

    // ==================== PERFORMANCE ANALYTICS ====================

    async generatePerformanceAnalytics(analyticsData: Partial<IPerformanceAnalytics>): Promise<IPerformanceAnalytics> {
        try {
            const analytics = new PerformanceAnalytics({
                analyticsId: `PANALYTICS-${Date.now()}`,
                ...analyticsData,
            });
            return await analytics.save();
        } catch (error) {
            throw new Error(`Failed to generate performance analytics: ${(error as Error).message}`);
        }
    }

    async getStudentAnalytics(studentId: string, period: string): Promise<IPerformanceAnalytics> {
        try {
            const analytics = await PerformanceAnalytics.findOne({ studentId, period }).sort({ date: -1 });
            if (!analytics) {
                // Generate and persist new analytics if none exists
                return await this.generatePerformanceAnalytics({ studentId, period: period as any });
            }
            return analytics;
        } catch (error) {
            throw new Error(`Failed to get student analytics: ${(error as Error).message}`);
        }
    }

    async compareStudentPerformance(studentIds: string[]): Promise<any> {
        try {
            const results = await PerformanceAnalytics.find({
                studentId: { $in: studentIds },
            }).sort({ date: -1 });

            const comparison: Record<string, any> = {};
            for (const studentId of studentIds) {
                const latest = results.find((r) => r.studentId === studentId);
                comparison[studentId] = latest || null;
            }
            return { students: studentIds, comparison };
        } catch (error) {
            throw new Error(`Failed to compare student performance: ${(error as Error).message}`);
        }
    }

    // ==================== BEHAVIORAL TRACKING ====================

    async recordBehavior(behaviorData: Partial<IBehavioralTracking>): Promise<IBehavioralTracking> {
        try {
            const behavior = new BehavioralTracking({
                behaviorId: `BEHAV-${Date.now()}`,
                ...behaviorData,
            });
            return await behavior.save();
        } catch (error) {
            throw new Error(`Failed to record behavior: ${(error as Error).message}`);
        }
    }

    async getStudentBehaviorHistory(studentId: string): Promise<IBehavioralTracking[]> {
        try {
            return await BehavioralTracking.find({ studentId }).sort({ date: -1 });
        } catch (error) {
            throw new Error(`Failed to get student behavior history: ${(error as Error).message}`);
        }
    }

    async getBehaviorSummary(studentId: string, days: number): Promise<any> {
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);

            const behaviors = await BehavioralTracking.find({
                studentId,
                date: { $gte: since },
            });

            const summary = { positive: 0, neutral: 0, negative: 0 };
            for (const b of behaviors) {
                if (b.behavior === 'positive') summary.positive++;
                else if (b.behavior === 'neutral') summary.neutral++;
                else if (b.behavior === 'negative') summary.negative++;
            }
            return summary;
        } catch (error) {
            throw new Error(`Failed to get behavior summary: ${(error as Error).message}`);
        }
    }

    // ==================== REPORT GENERATION ====================

    async generateReport(reportData: Partial<IReportGeneration>): Promise<IReportGeneration> {
        try {
            const report = new ReportGeneration({
                reportId: `REPORT-${Date.now()}`,
                ...reportData,
                status: 'draft',
            });
            return await report.save();
        } catch (error) {
            throw new Error(`Failed to generate report: ${(error as Error).message}`);
        }
    }

    async finalizeReport(reportId: string): Promise<IReportGeneration> {
        try {
            const report = await ReportGeneration.findOneAndUpdate(
                { reportId },
                { $set: { status: 'finalized' } },
                { new: true }
            );
            if (!report) {
                throw new Error(`Report with id ${reportId} not found`);
            }
            return report;
        } catch (error) {
            throw new Error(`Failed to finalize report: ${(error as Error).message}`);
        }
    }

    async sendReportToParent(reportId: string, parentId: string): Promise<IReportGeneration> {
        try {
            const report = await ReportGeneration.findOneAndUpdate(
                { reportId },
                { $set: { status: 'sent', sentDate: new Date() } },
                { new: true }
            );
            if (!report) {
                throw new Error(`Report with id ${reportId} not found`);
            }
            return report;
        } catch (error) {
            throw new Error(`Failed to send report to parent: ${(error as Error).message}`);
        }
    }

    async getStudentReports(studentId: string): Promise<IReportGeneration[]> {
        try {
            return await ReportGeneration.find({ studentId }).sort({ generatedDate: -1 });
        } catch (error) {
            throw new Error(`Failed to get student reports: ${(error as Error).message}`);
        }
    }

    // ==================== ASSESSMENT TEMPLATES ====================

    async createTemplate(templateData: Partial<IAssessmentTemplate>): Promise<IAssessmentTemplate> {
        try {
            const template = new AssessmentTemplate({
                templateId: `TEMPLATE-${Date.now()}`,
                ...templateData,
                isActive: true,
            });
            return await template.save();
        } catch (error) {
            throw new Error(`Failed to create template: ${(error as Error).message}`);
        }
    }

    async getTemplatesByProgram(programId: string): Promise<IAssessmentTemplate[]> {
        try {
            return await AssessmentTemplate.find({ programId, isActive: true }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to get templates by program: ${(error as Error).message}`);
        }
    }

    async updateTemplate(templateId: string, updates: Partial<IAssessmentTemplate>): Promise<IAssessmentTemplate> {
        try {
            const template = await AssessmentTemplate.findOneAndUpdate(
                { templateId },
                { $set: updates },
                { new: true, runValidators: true }
            );
            if (!template) {
                throw new Error(`Template with id ${templateId} not found`);
            }
            return template;
        } catch (error) {
            throw new Error(`Failed to update template: ${(error as Error).message}`);
        }
    }

    // ==================== STUDENT PORTFOLIO ====================

    async createPortfolio(portfolioData: Partial<IStudentPortfolio>): Promise<IStudentPortfolio> {
        try {
            const portfolio = new StudentPortfolio({
                portfolioId: `PORT-${Date.now()}`,
                ...portfolioData,
            });
            return await portfolio.save();
        } catch (error) {
            throw new Error(`Failed to create portfolio: ${(error as Error).message}`);
        }
    }

    async addAchievement(portfolioId: string, achievement: any): Promise<IStudentPortfolio> {
        try {
            const portfolio = await StudentPortfolio.findOneAndUpdate(
                { portfolioId },
                { $push: { achievements: achievement } },
                { new: true }
            );
            if (!portfolio) {
                throw new Error(`Portfolio with id ${portfolioId} not found`);
            }
            return portfolio;
        } catch (error) {
            throw new Error(`Failed to add achievement: ${(error as Error).message}`);
        }
    }

    async addCertificate(portfolioId: string, certificate: any): Promise<IStudentPortfolio> {
        try {
            const portfolio = await StudentPortfolio.findOneAndUpdate(
                { portfolioId },
                { $push: { certificates: certificate } },
                { new: true }
            );
            if (!portfolio) {
                throw new Error(`Portfolio with id ${portfolioId} not found`);
            }
            return portfolio;
        } catch (error) {
            throw new Error(`Failed to add certificate: ${(error as Error).message}`);
        }
    }

    async getStudentPortfolio(studentId: string): Promise<IStudentPortfolio> {
        try {
            const portfolio = await StudentPortfolio.findOne({ studentId });
            if (!portfolio) {
                // Auto-create a portfolio if none exists
                return await this.createPortfolio({ studentId });
            }
            return portfolio;
        } catch (error) {
            throw new Error(`Failed to get student portfolio: ${(error as Error).message}`);
        }
    }

    // ==================== PARENT NOTIFICATIONS ====================

    async sendParentNotification(notificationData: Partial<IParentNotification>): Promise<IParentNotification> {
        try {
            const notification = new ParentNotification({
                notificationId: `NOTIF-${Date.now()}`,
                ...notificationData,
                isRead: false,
            });
            return await notification.save();
        } catch (error) {
            throw new Error(`Failed to send parent notification: ${(error as Error).message}`);
        }
    }

    async getParentNotifications(parentId: string): Promise<IParentNotification[]> {
        try {
            return await ParentNotification.find({ parentId }).sort({ sentDate: -1 });
        } catch (error) {
            throw new Error(`Failed to get parent notifications: ${(error as Error).message}`);
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<IParentNotification> {
        try {
            const notification = await ParentNotification.findOneAndUpdate(
                { notificationId },
                { $set: { isRead: true } },
                { new: true }
            );
            if (!notification) {
                throw new Error(`Notification with id ${notificationId} not found`);
            }
            return notification;
        } catch (error) {
            throw new Error(`Failed to mark notification as read: ${(error as Error).message}`);
        }
    }

    // ==================== ASSESSMENT SCHEDULING ====================

    async scheduleAssessment(scheduleData: Partial<IAssessmentSchedule>): Promise<IAssessmentSchedule> {
        try {
            const schedule = new AssessmentSchedule({
                scheduleId: `SCHED-${Date.now()}`,
                ...scheduleData,
            });
            return await schedule.save();
        } catch (error) {
            throw new Error(`Failed to schedule assessment: ${(error as Error).message}`);
        }
    }

    async getUpcomingAssessments(centerId: string): Promise<IAssessmentSchedule[]> {
        try {
            return await AssessmentSchedule.find({
                centerId,
                nextScheduledDate: { $gte: new Date() },
            }).sort({ nextScheduledDate: 1 });
        } catch (error) {
            throw new Error(`Failed to get upcoming assessments: ${(error as Error).message}`);
        }
    }

    async updateAssessmentSchedule(scheduleId: string, nextDate: Date): Promise<IAssessmentSchedule> {
        try {
            const schedule = await AssessmentSchedule.findOneAndUpdate(
                { scheduleId },
                { $set: { nextScheduledDate: nextDate, lastAssessmentDate: new Date() } },
                { new: true }
            );
            if (!schedule) {
                throw new Error(`Schedule with id ${scheduleId} not found`);
            }
            return schedule;
        } catch (error) {
            throw new Error(`Failed to update assessment schedule: ${(error as Error).message}`);
        }
    }
}
