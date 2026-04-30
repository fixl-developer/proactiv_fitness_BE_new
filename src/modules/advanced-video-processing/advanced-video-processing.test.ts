import { AdvancedVideoProcessingService } from './advanced-video-processing.service';

describe('AdvancedVideoProcessingService', () => {
    let service: AdvancedVideoProcessingService;

    beforeEach(() => {
        service = new AdvancedVideoProcessingService();
    });

    describe('uploadVideo', () => {
        it('should upload a video', async () => {
            const video = await service.uploadVideo({
                title: 'Class Recording',
                description: 'Gymnastics class',
                coachId: 'coach123',
                classId: 'class123'
            });
            expect(video).toBeDefined();
            expect(video.videoId).toBeDefined();
        });
    });

    describe('transcodeVideo', () => {
        it('should transcode a video', async () => {
            const video = await service.uploadVideo({
                title: 'Class Recording',
                coachId: 'coach123'
            });
            const transcoded = await service.transcodeVideo(video.videoId, 'mp4');
            expect(transcoded).toBeDefined();
            expect(transcoded.format).toBe('mp4');
        });
    });

    describe('getVideoAnalytics', () => {
        it('should get video analytics', async () => {
            const video = await service.uploadVideo({
                title: 'Class Recording',
                coachId: 'coach123'
            });
            const analytics = await service.getVideoAnalytics(video.videoId);
            expect(analytics).toBeDefined();
            expect(analytics.views).toBeGreaterThanOrEqual(0);
        });
    });
});
