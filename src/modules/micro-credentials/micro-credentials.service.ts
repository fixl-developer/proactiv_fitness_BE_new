import { FilterQuery } from 'mongoose';
import { MicroCredential, IssuedCredential, BadgeSystem, EarnedBadge } from './micro-credentials.model';
import {
    IMicroCredential,
    IIssuedCredential,
    IBadgeSystem,
    IEarnedBadge,
    ICreateCredentialRequest,
    IIssueCredentialRequest,
    ICreateBadgeRequest,
    IAwardBadgeRequest,
    IVerifyCredentialRequest,
    ICredentialSummary,
    IBadgeCollection,
    ICredentialPortfolio,
    IVerificationResult,
    CertificationStatus,
    VerificationStatus
} from './micro-credentials.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class MicroCredentialService extends BaseService<IMicroCredential> {
    constructor() {
        super(MicroCredential);
    }

    /**
     * Create micro-credential definition
     */
    async createCredential(credentialRequest: ICreateCredentialRequest, createdBy: string): Promise<IMicroCredential> {
        try {
            const credentialId = this.generateCredentialId();
            const verificationCode = this.generateVerificationCode();

            const credential = new MicroCredential({
                credentialId,
                name: credentialRequest.name,
                description: credentialRequest.description,
                category: credentialRequest.category,
                level: credentialRequest.level,
                badgeImageUrl: await this.generateBadgeImage(credentialRequest),
                badgeType: credentialRequest.badgeType,
                colorScheme: await this.generateColorScheme(credentialRequest.level),
                requirements: credentialRequest.requirements,
                validationRules: credentialRequest.validationRules,
                assessmentCriteria: credentialRequest.assessmentCriteria,
                expirationRules: credentialRequest.expirationRules,
                certificateTemplate: await this.generateCertificateTemplate(credentialRequest),
                verificationSystem: {
                    verificationMethod: 'qr_code',
                    publicVerificationUrl: `https://verify.proactiv.com/${credentialId}`,
                    verificationCode
                },
                statistics: {
                    totalIssued: 0,
                    totalActive: 0,
                    totalExpired: 0,
                    averageTimeToEarn: 0,
                    successRate: 0
                },
                businessUnitId: await this.getBusinessUnitId(),
                createdBy,
                updatedBy: createdBy
            });

            await credential.save();
            return credential;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create micro-credential',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Issue credential to recipient
     */
    async issueCredential(issueRequest: IIssueCredentialRequest, issuedBy: string): Promise<IIssuedCredential> {
        try {
            // Validate credential exists and is active
            const credential = await MicroCredential.findOne({
                credentialId: issueRequest.credentialId,
                isActive: true
            });

            if (!credential) {
                throw new AppError('Credential not found or inactive', HTTP_STATUS.NOT_FOUND);
            }

            // Check if recipient already has this credential
            const existingCredential = await IssuedCredential.findOne({
                credentialId: issueRequest.credentialId,
                recipientId: issueRequest.recipientId,
                status: { $in: [CertificationStatus.EARNED, CertificationStatus.ACTIVE] }
            });

            if (existingCredential) {
                throw new AppError('Recipient already has this credential', HTTP_STATUS.CONFLICT);
            }

            // Validate requirements are met
            await this.validateRequirements(credential, issueRequest.achievementData);

            // Generate digital certificate
            const digitalCertificate = await this.generateDigitalCertificate(credential, issueRequest);

            const issuedCredentialId = this.generateIssuedCredentialId();
            const recipientName = await this.getRecipientName(issueRequest.recipientId);

            const issuedCredential = new IssuedCredential({
                issuedCredentialId,
                credentialId: issueRequest.credentialId,
                credentialName: credential.name,
                recipientId: issueRequest.recipientId,
                recipientName,
                issuedDate: new Date(),
                issuedBy,
                issuedByName: await this.getStaffName(issuedBy),
                status: CertificationStatus.EARNED,
                achievementData: issueRequest.achievementData,
                assessmentResults: issueRequest.assessmentResults,
                digitalCertificate,
                verificationHistory: [],
                expirationDate: this.calculateExpirationDate(credential.expirationRules),
                isExpired: false,
                renewalHistory: [],
                sharingSettings: {
                    isPublic: false,
                    shareWithEmployers: false,
                    shareWithEducators: true,
                    shareOnSocialMedia: false
                },
                businessUnitId: credential.businessUnitId,
                locationId: await this.getLocationId(issueRequest.recipientId),
                createdBy: issuedBy,
                updatedBy: issuedBy
            });

            await issuedCredential.save();

            // Update credential statistics
            await this.updateCredentialStatistics(credential.credentialId);

            return issuedCredential;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to issue credential',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods will be added in the next part
    private generateCredentialId(): string {
        return `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateVerificationCode(): string {
        return Math.random().toString(36).substr(2, 12).toUpperCase();
    }

    private generateIssuedCredentialId(): string {
        return `issued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Verify credential
     */
    async verifyCredential(verifyRequest: IVerifyCredentialRequest): Promise < IVerificationResult > {
    try {
        const issuedCredential = await IssuedCredential.findOne({
            issuedCredentialId: verifyRequest.credentialId
        });

        if(!issuedCredential) {
            return {
                isValid: false,
                verificationDate: new Date(),
                verificationMethod: verifyRequest.verificationMethod,
                errorMessage: 'Credential not found'
            };
        }

            // Check verification code
            const credential = await MicroCredential.findOne({
            credentialId: issuedCredential.credentialId
        });

        if(!credential || credential.verificationSystem.verificationCode !== verifyRequest.verificationCode) {
    return {
        isValid: false,
        verificationDate: new Date(),
        verificationMethod: verifyRequest.verificationMethod,
        errorMessage: 'Invalid verification code'
    };
}

// Check if expired
if (issuedCredential.isExpired) {
    return {
        isValid: false,
        verificationDate: new Date(),
        verificationMethod: verifyRequest.verificationMethod,
        errorMessage: 'Credential has expired'
    };
}

// Check if revoked
if (issuedCredential.status === CertificationStatus.REVOKED) {
    return {
        isValid: false,
        verificationDate: new Date(),
        verificationMethod: verifyRequest.verificationMethod,
        errorMessage: 'Credential has been revoked'
    };
}

// Record verification
const verificationId = this.generateVerificationId();
issuedCredential.verificationHistory.push({
    verificationId,
    verifiedBy: 'Public Verification',
    verifiedDate: new Date(),
    verificationMethod: verifyRequest.verificationMethod,
    status: VerificationStatus.VERIFIED
});

await issuedCredential.save();

return {
    isValid: true,
    credentialInfo: {
        name: issuedCredential.credentialName,
        recipientName: issuedCredential.recipientName,
        issuedDate: issuedCredential.issuedDate,
        issuedBy: issuedCredential.issuedByName,
        status: issuedCredential.status,
        expirationDate: issuedCredential.expirationDate
    },
    verificationDate: new Date(),
    verificationMethod: verifyRequest.verificationMethod
};
        } catch (error: any) {
    throw new AppError(
        error.message || 'Failed to verify credential',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
}
    }

    /**
     * Get credential portfolio for recipient
     */
    async getCredentialPortfolio(recipientId: string): Promise < ICredentialPortfolio > {
    try {
        const credentials = await IssuedCredential.find({ recipientId });
        const recipientName = await this.getRecipientName(recipientId);

        const activeCredentials = credentials.filter(c =>
            c.status === CertificationStatus.EARNED && !c.isExpired
        );
        const expiredCredentials = credentials.filter(c => c.isExpired);

        // Group by level
        const credentialsByLevel = await this.groupCredentialsByLevel(credentials);

        // Group by category
        const credentialsByCategory = await this.groupCredentialsByCategory(credentials);

        // Get recent credentials (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCredentials = credentials
            .filter(c => c.issuedDate >= thirtyDaysAgo)
            .map(c => this.mapToCredentialSummary(c))
            .slice(0, 5);

        // Get expiring credentials (next 30 days)
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const expiringCredentials = credentials
            .filter(c => c.expirationDate && c.expirationDate <= thirtyDaysFromNow && !c.isExpired)
            .map(c => this.mapToCredentialSummary(c));

        return {
            recipientId,
            recipientName,
            totalCredentials: credentials.length,
            activeCredentials: activeCredentials.length,
            expiredCredentials: expiredCredentials.length,
            credentialsByLevel,
            credentialsByCategory,
            recentCredentials,
            expiringCredentials
        };
    } catch(error: any) {
        throw new AppError(
            error.message || 'Failed to get credential portfolio',
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

    // Private helper methods
    private async generateBadgeImage(credentialRequest: ICreateCredentialRequest): Promise < string > {
    // Implementation to generate badge image
    return `https://storage.example.com/badges/${credentialRequest.badgeType}_${credentialRequest.level}.png`;
}

    private async generateColorScheme(level: any): Promise < any > {
    const colorSchemes = {
        bronze: { primary: '#CD7F32', secondary: '#8B4513', accent: '#FFD700' },
        silver: { primary: '#C0C0C0', secondary: '#808080', accent: '#FFFFFF' },
        gold: { primary: '#FFD700', secondary: '#FFA500', accent: '#FFFF00' },
        platinum: { primary: '#E5E4E2', secondary: '#B8860B', accent: '#F0F8FF' },
        diamond: { primary: '#B9F2FF', secondary: '#4169E1', accent: '#00BFFF' }
    };
    return colorSchemes[level] || colorSchemes.bronze;
}

    private async generateCertificateTemplate(credentialRequest: ICreateCredentialRequest): Promise < any > {
    return {
        templateId: `template_${credentialRequest.level}`,
        layout: 'standard',
        includeQRCode: true,
        includeBlockchain: false,
        customFields: [
            { fieldName: 'credentialName', fieldValue: credentialRequest.name, isVariable: false },
            { fieldName: 'recipientName', fieldValue: '{{recipientName}}', isVariable: true },
            { fieldName: 'issuedDate', fieldValue: '{{issuedDate}}', isVariable: true }
        ]
    };
}

    private async generateDigitalCertificate(credential: IMicroCredential, issueRequest: IIssueCredentialRequest): Promise < any > {
    const certificateId = this.generateCertificateId();
    return {
        certificateUrl: `https://certificates.proactiv.com/${certificateId}.pdf`,
        certificateHash: this.generateCertificateHash(certificateId),
        qrCodeUrl: `https://qr.proactiv.com/${certificateId}.png`,
        verificationUrl: `https://verify.proactiv.com/${certificateId}`
    };
}

    private async validateRequirements(credential: IMicroCredential, achievementData: any): Promise < void> {
    // Implementation to validate all requirements are met
    // This would check skills, attendance, behavior, performance requirements
}

    private calculateExpirationDate(expirationRules: any): Date | undefined {
    if (!expirationRules.hasExpiration) return undefined;

    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setMonth(expirationDate.getMonth() + expirationRules.validityPeriod);

    return expirationDate;
}

    private async updateCredentialStatistics(credentialId: string): Promise < void> {
    const credential = await MicroCredential.findOne({ credentialId });
    if(!credential) return;

    const issuedCredentials = await IssuedCredential.find({ credentialId });

    credential.statistics.totalIssued = issuedCredentials.length;
    credential.statistics.totalActive = issuedCredentials.filter(c =>
        c.status === CertificationStatus.EARNED && !c.isExpired
    ).length;
    credential.statistics.totalExpired = issuedCredentials.filter(c => c.isExpired).length;

    await credential.save();
}

    private async groupCredentialsByLevel(credentials: IIssuedCredential[]): Promise < any[] > {
    // Implementation to group credentials by level
    return [];
}

    private async groupCredentialsByCategory(credentials: IIssuedCredential[]): Promise < any[] > {
    // Implementation to group credentials by category
    return [];
}

    private mapToCredentialSummary(credential: IIssuedCredential): ICredentialSummary {
    return {
        credentialId: credential.issuedCredentialId,
        name: credential.credentialName,
        level: 'bronze' as any, // Would get from credential definition
        status: credential.status,
        issuedDate: credential.issuedDate,
        expirationDate: credential.expirationDate,
        isExpired: credential.isExpired,
        verificationUrl: credential.digitalCertificate.verificationUrl,
        badgeImageUrl: 'badge_url' // Would get from credential definition
    };
}

    private async getBusinessUnitId(): Promise < string > {
    return 'business_unit_id'; // Placeholder
}

    private async getRecipientName(recipientId: string): Promise < string > {
    return `Recipient ${recipientId}`;
}

    private async getStaffName(staffId: string): Promise < string > {
    return `Staff ${staffId}`;
}

    private async getLocationId(recipientId: string): Promise < string > {
    return 'location_id'; // Placeholder
}

    private generateVerificationId(): string {
    return `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

    private generateCertificateId(): string {
    return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

    private generateCertificateHash(certificateId: string): string {
    return `hash_${certificateId}_${Math.random().toString(36).substr(2, 16)}`;
}
}

export class BadgeService extends BaseService<IBadgeSystem> {
    constructor() {
        super(BadgeSystem);
    }

    /**
     * Create badge definition
     */
    async createBadge(badgeRequest: ICreateBadgeRequest, createdBy: string): Promise<IBadgeSystem> {
        try {
            const badgeId = this.generateBadgeId();

            const badge = new BadgeSystem({
                badgeId,
                name: badgeRequest.name,
                description: badgeRequest.description,
                category: badgeRequest.category,
                badgeType: badgeRequest.badgeType,
                imageUrl: await this.generateBadgeImageUrl(badgeRequest),
                iconUrl: await this.generateBadgeIconUrl(badgeRequest),
                colorScheme: await this.generateBadgeColorScheme(badgeRequest.rarity),
                earningCriteria: badgeRequest.earningCriteria,
                pointValue: badgeRequest.pointValue,
                rarity: badgeRequest.rarity,
                difficulty: badgeRequest.difficulty,
                estimatedTimeToEarn: this.calculateEstimatedTime(badgeRequest.difficulty),
                businessUnitId: await this.getBusinessUnitId(),
                createdBy,
                updatedBy: createdBy
            });

            await badge.save();
            return badge;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create badge',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Award badge to recipient
     */
    async awardBadge(awardRequest: IAwardBadgeRequest, awardedBy: string): Promise<IEarnedBadge> {
        try {
            const badge = await BadgeSystem.findOne({
                badgeId: awardRequest.badgeId,
                isActive: true
            });

            if (!badge) {
                throw new AppError('Badge not found or inactive', HTTP_STATUS.NOT_FOUND);
            }

            // Check if badge is stackable or if recipient already has it
            if (!badge.earningCriteria.isStackable) {
                const existingBadge = await EarnedBadge.findOne({
                    badgeId: awardRequest.badgeId,
                    recipientId: awardRequest.recipientId
                });

                if (existingBadge) {
                    throw new AppError('Recipient already has this badge', HTTP_STATUS.CONFLICT);
                }
            }

            const earnedBadgeId = this.generateEarnedBadgeId();
            const recipientName = await this.getRecipientName(awardRequest.recipientId);

            const earnedBadge = new EarnedBadge({
                earnedBadgeId,
                badgeId: awardRequest.badgeId,
                badgeName: badge.name,
                recipientId: awardRequest.recipientId,
                recipientName,
                earnedDate: new Date(),
                earnedBy: awardedBy,
                earnedByName: await this.getStaffName(awardedBy),
                achievementContext: awardRequest.achievementContext,
                pointsEarned: badge.pointValue,
                bonusPoints: badge.bonusMultiplier ? badge.pointValue * (badge.bonusMultiplier - 1) : 0,
                totalPoints: badge.pointValue * (badge.bonusMultiplier || 1),
                displaySettings: {
                    isVisible: true,
                    isPinned: false,
                    displayOrder: 0,
                    showOnProfile: true
                },
                businessUnitId: badge.businessUnitId,
                locationId: await this.getLocationId(awardRequest.recipientId),
                createdBy: awardedBy,
                updatedBy: awardedBy
            });

            await earnedBadge.save();
            return earnedBadge;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to award badge',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get badge collection for recipient
     */
    async getBadgeCollection(recipientId: string): Promise<IBadgeCollection> {
        try {
            const earnedBadges = await EarnedBadge.find({ recipientId });
            const recipientName = await this.getRecipientName(recipientId);

            const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.totalPoints, 0);

            // Group by category
            const badgesByCategory = await this.groupBadgesByCategory(earnedBadges);

            // Get recent badges (last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const recentBadges = earnedBadges
                .filter(badge => badge.earnedDate >= thirtyDaysAgo)
                .sort((a, b) => b.earnedDate.getTime() - a.earnedDate.getTime())
                .slice(0, 5);

            // Get pinned badges
            const pinnedBadges = earnedBadges
                .filter(badge => badge.displaySettings.isPinned)
                .sort((a, b) => a.displaySettings.displayOrder - b.displaySettings.displayOrder);

            // Calculate achievements
            const achievements = await this.calculateBadgeAchievements(earnedBadges);

            return {
                recipientId,
                recipientName,
                totalBadges: earnedBadges.length,
                totalPoints,
                badgesByCategory,
                recentBadges,
                pinnedBadges,
                achievements
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get badge collection',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods
    private async generateBadgeImageUrl(badgeRequest: ICreateBadgeRequest): Promise<string> {
        return `https://storage.example.com/badges/${badgeRequest.badgeType}_${badgeRequest.rarity}.png`;
    }

    private async generateBadgeIconUrl(badgeRequest: ICreateBadgeRequest): Promise<string> {
        return `https://storage.example.com/icons/${badgeRequest.badgeType}.svg`;
    }

    private async generateBadgeColorScheme(rarity: string): Promise<any> {
        const colorSchemes = {
            common: { primary: '#808080', secondary: '#A0A0A0', background: '#F5F5F5' },
            uncommon: { primary: '#00FF00', secondary: '#32CD32', background: '#F0FFF0' },
            rare: { primary: '#0080FF', secondary: '#4169E1', background: '#F0F8FF' },
            epic: { primary: '#8000FF', secondary: '#9932CC', background: '#F8F0FF' },
            legendary: { primary: '#FF8000', secondary: '#FF6347', background: '#FFF8DC' }
        };
        return colorSchemes[rarity] || colorSchemes.common;
    }

    private calculateEstimatedTime(difficulty: string): number {
        const timeMap = {
            easy: 7,    // 1 week
            medium: 30, // 1 month
            hard: 90,   // 3 months
            expert: 180 // 6 months
        };
        return timeMap[difficulty] || 30;
    }

    private async groupBadgesByCategory(earnedBadges: IEarnedBadge[]): Promise<any[]> {
        // Implementation to group badges by category
        return [];
    }

    private async calculateBadgeAchievements(earnedBadges: IEarnedBadge[]): Promise<any> {
        // Implementation to calculate various badge achievements
        return {
            totalSkillBadges: 0,
            totalAttendanceBadges: 0,
            totalBehaviorBadges: 0,
            totalLeadershipBadges: 0,
            rareBadges: 0,
            legendaryBadges: 0
        };
    }

    private async getBusinessUnitId(): Promise<string> {
        return 'business_unit_id'; // Placeholder
    }

    private async getRecipientName(recipientId: string): Promise<string> {
        return `Recipient ${recipientId}`;
    }

    private async getStaffName(staffId: string): Promise<string> {
        return `Staff ${staffId}`;
    }

    private async getLocationId(recipientId: string): Promise<string> {
        return 'location_id'; // Placeholder
    }

    private generateBadgeId(): string {
        return `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateEarnedBadgeId(): string {
        return `earned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}