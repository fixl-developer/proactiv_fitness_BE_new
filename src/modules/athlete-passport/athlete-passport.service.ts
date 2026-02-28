import { FilterQuery } from 'mongoose';
import { AthletePassport, SkillTaxonomy, PerformanceBenchmark } from './athlete-passport.model';
import {
    IAthletePassport,
    ISkillTaxonomy,
    IPerformanceBenchmark,
    ICreatePassportRequest,
    IUpdateSkillRequest,
    IAddMilestoneRequest,
    IRecordBenchmarkRequest,
    ITransferRequest,
    IExportRequest,
    IPassportSummary,
    ISkillProgressReport,
    ITranscriptData,
    SkillLevel,
    CertificationStatus,
    MilestoneType,
    TransferStatus
} from './athlete-passport.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class AthletePassportService extends BaseService<IAthletePassport> {
    constructor() {
        super(AthletePassport);
    }

    /**
     * Create athlete passport
     */
    async createPassport(passportRequest: ICreatePassportRequest, createdBy: string): Promise<IAthletePassport> {
        try {
            // Check if passport already exists for this child
            const existingPassport = await AthletePassport.findOne({ childId: passportRequest.childId });
            if (existingPassport) {
                throw new AppError('Athlete passport already exists for this child', HTTP_STATUS.CONFLICT);
            }

            const passportId = this.generatePassportId();
            const childInfo = await this.getChildInfo(passportRequest.childId);

            const passport = new AthletePassport({
                passportId,
                childId: passportRequest.childId,
                childName: childInfo.name,
                dateOfBirth: childInfo.dateOfBirth,
                currentPrograms: passportRequest.initialPrograms,
                enrollmentDate: new Date(),
                skillsProgress: [],
                certifications: [],
                milestones: [],
                benchmarks: [],
                attendanceStats: {
                    totalSessions: 0,
                    attendedSessions: 0,
                    attendanceRate: 0,
                    consecutiveAttendance: 0,
                    longestStreak: 0,
                    monthlyStats: []
                },
                behaviorProfile: {
                    positiveNotes: [],
                    areasForImprovement: [],
                    leadershipMoments: []
                },
                healthProfile: {
                    medicalAlerts: childInfo.medicalAlerts || [],
                    injuryHistory: [],
                    safetyTraining: []
                },
                transferHistory: [],
                exportHistory: [],
                privacySettings: passportRequest.privacySettings || {
                    shareWithCoaches: true,
                    shareWithParents: true,
                    shareForResearch: false,
                    shareForMarketing: false,
                    allowPhotoVideo: true,
                    allowPublicRecognition: true
                },
                businessUnitId: childInfo.businessUnitId,
                locationIds: childInfo.locationIds,
                createdBy,
                updatedBy: createdBy
            });

            await passport.save();
            return passport;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create athlete passport',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update skill progress
     */
    async updateSkillProgress(
        passportId: string,
        skillUpdate: IUpdateSkillRequest,
        updatedBy: string
    ): Promise<IAthletePassport> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            // Find existing skill or create new one
            let skillIndex = passport.skillsProgress.findIndex(skill => skill.skillId === skillUpdate.skillId);

            if (skillIndex === -1) {
                // Add new skill
                const skillInfo = await this.getSkillInfo(skillUpdate.skillId);
                passport.skillsProgress.push({
                    skillId: skillUpdate.skillId,
                    skillName: skillInfo.skillName,
                    category: skillInfo.category,
                    currentLevel: skillUpdate.newLevel,
                    dateAchieved: skillUpdate.newLevel === SkillLevel.MASTERED ? new Date() : undefined,
                    coachNotes: skillUpdate.coachNotes,
                    videoEvidence: skillUpdate.videoEvidence || [],
                    assessmentHistory: [{
                        date: new Date(),
                        level: skillUpdate.newLevel,
                        assessedBy: skillUpdate.assessedBy,
                        notes: skillUpdate.coachNotes
                    }]
                });
            } else {
                // Update existing skill
                const skill = passport.skillsProgress[skillIndex];
                const previousLevel = skill.currentLevel;

                skill.currentLevel = skillUpdate.newLevel;
                skill.coachNotes = skillUpdate.coachNotes;
                skill.videoEvidence = [...(skill.videoEvidence || []), ...(skillUpdate.videoEvidence || [])];

                if (skillUpdate.newLevel === SkillLevel.MASTERED && previousLevel !== SkillLevel.MASTERED) {
                    skill.dateAchieved = new Date();
                }

                // Add to assessment history
                skill.assessmentHistory.push({
                    date: new Date(),
                    level: skillUpdate.newLevel,
                    assessedBy: skillUpdate.assessedBy,
                    notes: skillUpdate.coachNotes
                });
            }

            // Update overall skill level if needed
            await this.updateOverallSkillLevel(passport);

            passport.updatedBy = updatedBy;
            await passport.save();

            return passport;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update skill progress',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add milestone achievement
     */
    async addMilestone(
        passportId: string,
        milestoneRequest: IAddMilestoneRequest,
        addedBy: string
    ): Promise<IAthletePassport> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            const milestoneId = this.generateMilestoneId();

            passport.milestones.push({
                milestoneId,
                type: milestoneRequest.type,
                title: milestoneRequest.title,
                description: milestoneRequest.description,
                achievedDate: new Date(),
                recognizedBy: milestoneRequest.recognizedBy,
                evidenceUrls: milestoneRequest.evidenceUrls || [],
                points: milestoneRequest.points || 0,
                badgeUrl: await this.generateBadgeUrl(milestoneRequest.type)
            });

            passport.updatedBy = addedBy;
            await passport.save();

            return passport;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add milestone',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Record performance benchmark
     */
    async recordBenchmark(
        passportId: string,
        benchmarkRequest: IRecordBenchmarkRequest,
        recordedBy: string
    ): Promise<IAthletePassport> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            const benchmarkInfo = await this.getBenchmarkInfo(benchmarkRequest.benchmarkId);

            // Check if this is a personal best
            const existingBenchmarks = passport.benchmarks.filter(b => b.benchmarkId === benchmarkRequest.benchmarkId);
            const isPersonalBest = this.isPersonalBest(benchmarkRequest.value, existingBenchmarks, benchmarkInfo.higherIsBetter);

            // Calculate age group ranking
            const ageGroupRanking = await this.calculateAgeGroupRanking(
                benchmarkRequest.benchmarkId,
                benchmarkRequest.value,
                passport.age
            );

            passport.benchmarks.push({
                benchmarkId: benchmarkRequest.benchmarkId,
                name: benchmarkInfo.name,
                category: benchmarkInfo.category,
                value: benchmarkRequest.value,
                unit: benchmarkInfo.unit,
                recordedDate: new Date(),
                recordedBy: benchmarkRequest.recordedBy,
                isPersonalBest,
                ageGroupRanking,
                notes: benchmarkRequest.notes
            });

            passport.updatedBy = recordedBy;
            await passport.save();

            return passport;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to record benchmark',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update attendance statistics
     */
    async updateAttendanceStats(passportId: string, sessionAttended: boolean): Promise<void> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            passport.attendanceStats.totalSessions += 1;

            if (sessionAttended) {
                passport.attendanceStats.attendedSessions += 1;
                passport.attendanceStats.consecutiveAttendance += 1;
                passport.attendanceStats.lastAttendanceDate = new Date();

                if (passport.attendanceStats.consecutiveAttendance > passport.attendanceStats.longestStreak) {
                    passport.attendanceStats.longestStreak = passport.attendanceStats.consecutiveAttendance;
                }
            } else {
                passport.attendanceStats.consecutiveAttendance = 0;
            }

            // Update monthly stats
            const currentMonth = new Date().toLocaleString('default', { month: 'long' });
            const currentYear = new Date().getFullYear();

            let monthlyStatIndex = passport.attendanceStats.monthlyStats.findIndex(
                stat => stat.month === currentMonth && stat.year === currentYear
            );

            if (monthlyStatIndex === -1) {
                passport.attendanceStats.monthlyStats.push({
                    month: currentMonth,
                    year: currentYear,
                    sessionsScheduled: 1,
                    sessionsAttended: sessionAttended ? 1 : 0,
                    rate: sessionAttended ? 100 : 0
                });
            } else {
                const monthlyStat = passport.attendanceStats.monthlyStats[monthlyStatIndex];
                monthlyStat.sessionsScheduled += 1;
                if (sessionAttended) {
                    monthlyStat.sessionsAttended += 1;
                }
                monthlyStat.rate = (monthlyStat.sessionsAttended / monthlyStat.sessionsScheduled) * 100;
            }

            await passport.save();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update attendance statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Request passport transfer
     */
    async requestTransfer(
        passportId: string,
        transferRequest: ITransferRequest
    ): Promise<IAthletePassport> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            const transferId = this.generateTransferId();

            passport.transferHistory.push({
                transferId,
                fromLocation: transferRequest.fromLocation,
                toLocation: transferRequest.toLocation,
                transferDate: new Date(),
                status: TransferStatus.PENDING,
                reason: transferRequest.reason,
                notes: `Transfer requested by ${transferRequest.requestedBy}`
            });

            await passport.save();
            return passport;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to request transfer',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Export passport data
     */
    async exportPassport(
        passportId: string,
        exportRequest: IExportRequest
    ): Promise<{ exportId: string; downloadUrl: string }> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            const exportId = this.generateExportId();
            let downloadUrl: string;

            switch (exportRequest.exportType) {
                case 'pdf':
                    downloadUrl = await this.generatePDFTranscript(passport);
                    break;
                case 'json':
                    downloadUrl = await this.generateJSONExport(passport);
                    break;
                case 'transcript':
                    downloadUrl = await this.generateOfficialTranscript(passport);
                    break;
                default:
                    throw new AppError('Invalid export type', HTTP_STATUS.BAD_REQUEST);
            }

            // Record export history
            passport.exportHistory.push({
                exportId,
                exportType: exportRequest.exportType,
                requestedBy: exportRequest.requestedBy,
                requestedDate: new Date(),
                purpose: exportRequest.purpose,
                recipientOrganization: exportRequest.recipientOrganization,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                downloadUrl
            });

            await passport.save();

            return { exportId, downloadUrl };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to export passport',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get passport summary
     */
    async getPassportSummary(passportId: string): Promise<IPassportSummary> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            return {
                passportId: passport.passportId,
                childName: passport.childName,
                currentLevel: passport.currentSkillLevel,
                totalSkills: passport.skillsProgress.length,
                masteredSkills: passport.masteredSkills,
                certifications: passport.totalCertifications,
                milestones: passport.totalMilestones,
                attendanceRate: passport.attendanceStats.attendanceRate,
                lastActivity: passport.lastActivityDate || passport.updatedAt,
                progressScore: passport.progressScore
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get passport summary',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Generate skill progress report
     */
    async generateSkillProgressReport(
        passportId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISkillProgressReport> {
        try {
            const passport = await AthletePassport.findOne({ passportId });
            if (!passport) {
                throw new AppError('Athlete passport not found', HTTP_STATUS.NOT_FOUND);
            }

            // Filter skills assessed in the period
            const skillsInPeriod = passport.skillsProgress.filter(skill =>
                skill.assessmentHistory.some(assessment =>
                    assessment.date >= startDate && assessment.date <= endDate
                )
            );

            // Calculate improvements
            const skillsImproved = skillsInPeriod.filter(skill => {
                const assessmentsInPeriod = skill.assessmentHistory.filter(a =>
                    a.date >= startDate && a.date <= endDate
                ).sort((a, b) => a.date.getTime() - b.date.getTime());

                if (assessmentsInPeriod.length < 2) return false;

                const firstLevel = this.getSkillLevelValue(assessmentsInPeriod[0].level);
                const lastLevel = this.getSkillLevelValue(assessmentsInPeriod[assessmentsInPeriod.length - 1].level);

                return lastLevel > firstLevel;
            });

            // Group by category
            const skillsByCategory = this.groupSkillsByCategory(passport.skillsProgress);

            return {
                childId: passport.childId,
                childName: passport.childName,
                reportPeriod: { startDate, endDate },
                skillsAssessed: skillsInPeriod.length,
                skillsImproved: skillsImproved.length,
                newSkillsLearned: skillsInPeriod.filter(skill =>
                    skill.assessmentHistory[0].date >= startDate
                ).length,
                skillsByCategory,
                recentAchievements: passport.milestones.filter(m =>
                    m.achievedDate >= startDate && m.achievedDate <= endDate
                ),
                recommendedFocus: await this.generateRecommendedFocus(passport),
                coachRecommendations: await this.generateCoachRecommendations(passport)
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to generate skill progress report',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async updateOverallSkillLevel(passport: IAthletePassport): Promise<void> {
        const skillLevels = passport.skillsProgress.map(skill => this.getSkillLevelValue(skill.currentLevel));
        if (skillLevels.length === 0) return;

        const averageLevel = skillLevels.reduce((sum, level) => sum + level, 0) / skillLevels.length;
        passport.currentSkillLevel = this.getSkillLevelFromValue(Math.round(averageLevel));
    }

    private getSkillLevelValue(level: SkillLevel): number {
        const levelValues = {
            [SkillLevel.NOT_ATTEMPTED]: 0,
            [SkillLevel.BEGINNER]: 1,
            [SkillLevel.DEVELOPING]: 2,
            [SkillLevel.PROFICIENT]: 3,
            [SkillLevel.MASTERED]: 4,
            [SkillLevel.ADVANCED]: 5
        };
        return levelValues[level] || 0;
    }

    private getSkillLevelFromValue(value: number): SkillLevel {
        const levels = [
            SkillLevel.NOT_ATTEMPTED,
            SkillLevel.BEGINNER,
            SkillLevel.DEVELOPING,
            SkillLevel.PROFICIENT,
            SkillLevel.MASTERED,
            SkillLevel.ADVANCED
        ];
        return levels[Math.min(value, levels.length - 1)];
    }

    private isPersonalBest(newValue: number, existingBenchmarks: any[], higherIsBetter: boolean): boolean {
        if (existingBenchmarks.length === 0) return true;

        const bestValue = higherIsBetter
            ? Math.max(...existingBenchmarks.map(b => b.value))
            : Math.min(...existingBenchmarks.map(b => b.value));

        return higherIsBetter ? newValue > bestValue : newValue < bestValue;
    }

    private groupSkillsByCategory(skills: any[]): any[] {
        const categories = new Map();

        skills.forEach(skill => {
            if (!categories.has(skill.category)) {
                categories.set(skill.category, {
                    category: skill.category,
                    total: 0,
                    mastered: 0,
                    inProgress: 0
                });
            }

            const categoryData = categories.get(skill.category);
            categoryData.total += 1;

            if (skill.currentLevel === SkillLevel.MASTERED) {
                categoryData.mastered += 1;
            } else if (skill.currentLevel !== SkillLevel.NOT_ATTEMPTED) {
                categoryData.inProgress += 1;
            }
        });

        return Array.from(categories.values());
    }

    private async getChildInfo(childId: string): Promise<any> {
        // Implementation to get child information from CRM module
        return {
            name: `Child ${childId}`,
            dateOfBirth: new Date('2015-01-01'),
            businessUnitId: 'business_unit_id',
            locationIds: ['location_id'],
            medicalAlerts: []
        };
    }

    private async getSkillInfo(skillId: string): Promise<any> {
        const skill = await SkillTaxonomy.findOne({ skillId });
        return skill || { skillName: `Skill ${skillId}`, category: 'General' };
    }

    private async getBenchmarkInfo(benchmarkId: string): Promise<any> {
        const benchmark = await PerformanceBenchmark.findOne({ benchmarkId });
        return benchmark || {
            name: `Benchmark ${benchmarkId}`,
            category: 'General',
            unit: 'points',
            higherIsBetter: true
        };
    }

    private async calculateAgeGroupRanking(benchmarkId: string, value: number, age: number): Promise<number> {
        // Implementation to calculate age group ranking
        return Math.floor(Math.random() * 100) + 1; // Placeholder
    }

    private async generateBadgeUrl(milestoneType: MilestoneType): Promise<string> {
        // Implementation to generate badge URL
        return `https://storage.example.com/badges/${milestoneType}.png`;
    }

    private async generatePDFTranscript(passport: IAthletePassport): Promise<string> {
        // Implementation to generate PDF transcript
        return `https://storage.example.com/transcripts/${passport.passportId}.pdf`;
    }

    private async generateJSONExport(passport: IAthletePassport): Promise<string> {
        // Implementation to generate JSON export
        return `https://storage.example.com/exports/${passport.passportId}.json`;
    }

    private async generateOfficialTranscript(passport: IAthletePassport): Promise<string> {
        // Implementation to generate official transcript
        return `https://storage.example.com/official/${passport.passportId}.pdf`;
    }

    private async generateRecommendedFocus(passport: IAthletePassport): Promise<string[]> {
        // Implementation to generate recommended focus areas
        return ['Balance', 'Coordination', 'Strength'];
    }

    private async generateCoachRecommendations(passport: IAthletePassport): Promise<string[]> {
        // Implementation to generate coach recommendations
        return ['Continue practicing basic skills', 'Focus on form and technique'];
    }

    private generatePassportId(): string {
        return `passport_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMilestoneId(): string {
        return `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateTransferId(): string {
        return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateExportId(): string {
        return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export class SkillTaxonomyService extends BaseService<ISkillTaxonomy> {
    constructor() {
        super(SkillTaxonomy);
    }

    /**
     * Create skill definition
     */
    async createSkill(skillData: any, createdBy: string): Promise<ISkillTaxonomy> {
        try {
            const skillId = this.generateSkillId();

            const skill = new SkillTaxonomy({
                skillId,
                ...skillData,
                createdBy,
                updatedBy: createdBy
            });

            await skill.save();
            return skill;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create skill',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateSkillId(): string {
        return `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export class PerformanceBenchmarkService extends BaseService<IPerformanceBenchmark> {
    constructor() {
        super(PerformanceBenchmark);
    }

    /**
     * Create performance benchmark
     */
    async createBenchmark(benchmarkData: any, createdBy: string): Promise<IPerformanceBenchmark> {
        try {
            const benchmarkId = this.generateBenchmarkId();

            const benchmark = new PerformanceBenchmark({
                benchmarkId,
                ...benchmarkData,
                createdBy,
                updatedBy: createdBy
            });

            await benchmark.save();
            return benchmark;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create benchmark',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateBenchmarkId(): string {
        return `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}