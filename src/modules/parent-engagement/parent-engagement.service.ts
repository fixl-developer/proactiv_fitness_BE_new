import { ParentEngagementModel, IProgressVideo, IMilestone, IEducationContent, IProgressReport, IWorkshop, ICommunicationPreferences, IFeedback, ISatisfactionSurvey } from './parent-engagement.model';
import { NotificationService } from '../notifications/notifications.service';

export class ParentEngagementService {
    private notificationService = new NotificationService();

    async generateProgressVideo(childId: string, period: 'weekly' | 'monthly' | 'quarterly', includePhotos: boolean, includeMetrics: boolean): Promise<IProgressVideo> {
        try {
            const video: IProgressVideo = {
                childId,
                period,
                generatedAt: new Date(),
                includePhotos,
                includeMetrics,
                videoUrl: `https://videos.proactiv.com/${childId}/${Date.now()}.mp4`,
                duration: Math.floor(Math.random() * 15) + 5,
                highlights: [],
                metrics: includeMetrics ? {
                    attendanceRate: Math.random() * 100,
                    skillsLearned: Math.floor(Math.random() * 10),
                    progressScore: Math.random() * 100,
                    engagementLevel: Math.random() * 100
                } : undefined,
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await ParentEngagementModel.create(video);
            return video;
        } catch (error) {
            throw new Error(`Failed to generate progress video: ${error.message}`);
        }
    }

    async getProgressVideos(childId: string): Promise<IProgressVideo[]> {
        try {
            return await ParentEngagementModel.find({ childId, type: 'video' });
        } catch (error) {
            throw new Error(`Failed to get progress videos: ${error.message}`);
        }
    }

    async shareVideo(videoId: string, recipientEmails: string[], message: string): Promise<any> {
        try {
            for (const email of recipientEmails) {
                await this.notificationService.sendEmail({
                    to: email,
                    subject: 'Your child\'s progress video is ready!',
                    template: 'progress-video-share',
                    data: { videoId, message }
                });
            }
            return { success: true, sharedWith: recipientEmails.length };
        } catch (error) {
            throw new Error(`Failed to share video: ${error.message}`);
        }
    }

    async createMilestone(milestoneData: Partial<IMilestone>): Promise<IMilestone> {
        try {
            const milestone: IMilestone = {
                ...milestoneData,
                achievedAt: new Date(),
                celebrationSent: false,
                createdAt: new Date(),
                updatedAt: new Date()
            } as IMilestone;

            await ParentEngagementModel.create(milestone);

            // Send celebration notification
            await this.notificationService.sendNotification({
                userId: milestoneData.parentId,
                type: 'milestone',
                title: `🎉 ${milestoneData.title}`,
                message: milestoneData.description,
                data: { milestoneId: milestone._id }
            });

            return milestone;
        } catch (error) {
            throw new Error(`Failed to create milestone: ${error.message}`);
        }
    }

    async getMilestones(childId: string): Promise<IMilestone[]> {
        try {
            return await ParentEngagementModel.find({ childId, type: 'milestone' });
        } catch (error) {
            throw new Error(`Failed to get milestones: ${error.message}`);
        }
    }

    async createEducationContent(contentData: Partial<IEducationContent>): Promise<IEducationContent> {
        try {
            const content: IEducationContent = {
                ...contentData,
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                likes: 0
            } as IEducationContent;

            await ParentEngagementModel.create(content);
            return content;
        } catch (error) {
            throw new Error(`Failed to create education content: ${error.message}`);
        }
    }

    async getEducationContent(): Promise<IEducationContent[]> {
        try {
            return await ParentEngagementModel.find({ type: 'education' }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to get education content: ${error.message}`);
        }
    }

    async createProgressReport(reportData: Partial<IProgressReport>): Promise<IProgressReport> {
        try {
            const report: IProgressReport = {
                ...reportData,
                generatedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            } as IProgressReport;

            await ParentEngagementModel.create(report);

            // Send report to parent
            await this.notificationService.sendEmail({
                to: reportData.parentEmail,
                subject: `Progress Report for ${reportData.childName}`,
                template: 'progress-report',
                data: report
            });

            return report;
        } catch (error) {
            throw new Error(`Failed to create progress report: ${error.message}`);
        }
    }

    async getProgressReports(childId: string): Promise<IProgressReport[]> {
        try {
            return await ParentEngagementModel.find({ childId, type: 'report' }).sort({ generatedAt: -1 });
        } catch (error) {
            throw new Error(`Failed to get progress reports: ${error.message}`);
        }
    }

    async scheduleWorkshop(workshopData: Partial<IWorkshop>): Promise<IWorkshop> {
        try {
            const workshop: IWorkshop = {
                ...workshopData,
                registeredParents: [],
                createdAt: new Date(),
                updatedAt: new Date()
            } as IWorkshop;

            await ParentEngagementModel.create(workshop);

            // Send workshop announcement
            await this.notificationService.sendNotification({
                userId: 'all-parents',
                type: 'workshop',
                title: `📚 New Workshop: ${workshopData.title}`,
                message: workshopData.description,
                data: { workshopId: workshop._id }
            });

            return workshop;
        } catch (error) {
            throw new Error(`Failed to schedule workshop: ${error.message}`);
        }
    }

    async getWorkshops(): Promise<IWorkshop[]> {
        try {
            return await ParentEngagementModel.find({ type: 'workshop' }).sort({ scheduledDate: 1 });
        } catch (error) {
            throw new Error(`Failed to get workshops: ${error.message}`);
        }
    }

    async updateCommunicationPreferences(parentId: string, preferences: Partial<ICommunicationPreferences>): Promise<ICommunicationPreferences> {
        try {
            const updated = await ParentEngagementModel.findByIdAndUpdate(
                parentId,
                { ...preferences, updatedAt: new Date() },
                { new: true }
            );
            return updated as ICommunicationPreferences;
        } catch (error) {
            throw new Error(`Failed to update communication preferences: ${error.message}`);
        }
    }

    async collectFeedback(feedbackData: Partial<IFeedback>): Promise<IFeedback> {
        try {
            const feedback: IFeedback = {
                ...feedbackData,
                submittedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            } as IFeedback;

            await ParentEngagementModel.create(feedback);
            return feedback;
        } catch (error) {
            throw new Error(`Failed to collect feedback: ${error.message}`);
        }
    }

    async getSatisfactionSurvey(parentId: string): Promise<ISatisfactionSurvey> {
        try {
            const survey = await ParentEngagementModel.findOne({ parentId, type: 'survey' });
            return survey as ISatisfactionSurvey;
        } catch (error) {
            throw new Error(`Failed to get satisfaction survey: ${error.message}`);
        }
    }
}
