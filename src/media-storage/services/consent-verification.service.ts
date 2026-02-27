import { Db } from 'mongodb';
import { ConsentRecord, ConsentType } from '../interfaces';
import { AuditVaultService } from '../../audit-vault';
import logger from '../../../shared/utils/logger.util';

export interface ConsentVerificationResult {
    hasConsent: boolean;
    consentRecords: ConsentRecord[];
    missingConsents: ConsentType[];
    expiredConsents: ConsentType[];
    reason: string;
}

/**
 * Consent Verification Service
 */
export class ConsentVerificationService {
    private db: Db;
    private auditVaultService: AuditVaultService;

    constructor(db: Db, auditVaultService: AuditVaultService) {
        this.db = db;
        this.auditVaultService = auditVaultService;
    }

    /**
     * Verify consent for file access
     */
    async verifyConsent(
        userId: string,
        fileId: string,
        tenantId: string,
        requiredConsentTypes: ConsentType[]
    ): Promise<ConsentVerificationResult> {
        try {
            // Get current consent records from audit vault
            const consentHistory = await this.auditVaultService
                .getQueryService()
                .getConsentHistory(userId, tenantId);

            // Parse consent records
            const consentRecords = this.parseConsentHistory(consentHistory);

            // Check each required consent type
            const missingConsents: ConsentType[] = [];
            const expiredConsents: ConsentType[] = [];
            const validConsents: ConsentRecord[] = [];

            for (const consentType of requiredConsentTypes) {
                const consent = this.findLatestConsent(consentRecords, consentType);

                if (!consent) {
                    missingConsents.push(consentType);
                } else if (!consent.granted) {
                    missingConsents.push(consentType);
                } else if (this.isConsentExpired(consent)) {
                    expiredConsents.push(consentType);
                } else {
                    validConsents.push(consent);
                }
            }

            const hasConsent = missingConsents.length === 0 && expiredConsents.length === 0;

            let reason = 'Consent verified';
            if (!hasConsent) {
                const reasons = [];
                if (missingConsents.length > 0) {
                    reasons.push(`Missing consents: ${missingConsents.join(', ')}`);
                }
                if (expiredConsents.length > 0) {
                    reasons.push(`Expired consents: ${expiredConsents.join(', ')}`);
                }
                reason = reasons.join('; ');
            }

            // Log consent verification
            await this.logConsentVerification(
                userId,
                fileId,
                tenantId,
                hasConsent,
                requiredConsentTypes,
                reason
            );

            return {
                hasConsent,
                consentRecords: validConsents,
                missingConsents,
                expiredConsents,
                reason
            };

        } catch (error) {
            logger.error('Consent verification failed', {
                userId,
                fileId,
                tenantId,
                error
            });

            return {
                hasConsent: false,
                consentRecords: [],
                missingConsents: requiredConsentTypes,
                expiredConsents: [],
                reason: `Verification error: ${error.message}`
            };
        }
    }

    /**
     * Verify guardian consent for minor
     */
    async verifyGuardianConsent(
        minorId: string,
        guardianId: string,
        tenantId: string,
        consentType: ConsentType
    ): Promise<ConsentVerificationResult> {
        try {
            // Check if guardian has custody rights
            const custodyHistory = await this.auditVaultService
                .getQueryService()
                .getCustodyHistory(minorId, tenantId);

            const hasValidCustody = this.verifyGuardianCustody(
                custodyHistory,
                guardianId,
                minorId
            );

            if (!hasValidCustody) {
                return {
                    hasConsent: false,
                    consentRecords: [],
                    missingConsents: [consentType],
                    expiredConsents: [],
                    reason: 'Guardian does not have valid custody rights'
                };
            }

            // Verify guardian's consent
            return this.verifyConsent(guardianId, `minor:${minorId}`, tenantId, [consentType]);

        } catch (error) {
            logger.error('Guardian consent verification failed', {
                minorId,
                guardianId,
                tenantId,
                error
            });

            return {
                hasConsent: false,
                consentRecords: [],
                missingConsents: [consentType],
                expiredConsents: [],
                reason: `Guardian verification error: ${error.message}`
            };
        }
    }

    /**
     * Get consent requirements for file type
     */
    getConsentRequirements(
        fileType: string,
        category: string,
        accessLevel: string
    ): ConsentType[] {
        const requirements: ConsentType[] = [];

        // Photo/video files always require photo consent
        if (fileType === 'image' || fileType === 'video') {
            requirements.push(ConsentType.PHOTO_VIDEO);
        }

        // Medical category requires medical consent
        if (category === 'medical') {
            requirements.push(ConsentType.MEDICAL);
        }

        // Marketing category requires marketing consent
        if (category === 'marketing') {
            requirements.push(ConsentType.MARKETING);
        }

        // All files require data processing consent
        requirements.push(ConsentType.DATA_PROCESSING);

        return requirements;
    }

    /**
     * Check if user is a minor
     */
    async isMinor(userId: string, tenantId: string): Promise<boolean> {
        try {
            // Get user information from IAM
            const usersCollection = this.db.collection('users');
            const user = await usersCollection.findOne({
                _id: userId,
                tenantId
            });

            if (!user || !user.dateOfBirth) {
                return false;
            }

            const age = this.calculateAge(user.dateOfBirth);
            return age < 18;

        } catch (error) {
            logger.error('Failed to check if user is minor', { userId, error });
            return false;
        }
    }

    /**
     * Get guardians for minor
     */
    async getGuardians(minorId: string, tenantId: string): Promise<string[]> {
        try {
            const custodyHistory = await this.auditVaultService
                .getQueryService()
                .getCustodyHistory(minorId, tenantId);

            const guardians = new Set<string>();

            for (const record of custodyHistory) {
                if (record.context?.guardianId && record.actionType === 'custody.added') {
                    guardians.add(record.context.guardianId);
                }
            }

            return Array.from(guardians);

        } catch (error) {
            logger.error('Failed to get guardians for minor', { minorId, error });
            return [];
        }
    }

    /**
     * Private methods
     */

    private parseConsentHistory(auditLogs: any[]): ConsentRecord[] {
        const consentRecords: ConsentRecord[] = [];

        for (const log of auditLogs) {
            if (log.actionType.startsWith('consent.')) {
                const record: ConsentRecord = {
                    userId: log.actorId,
                    consentType: this.mapConsentType(log.context?.consentType),
                    granted: log.context?.newState || false,
                    grantedAt: log.timestamp,
                    expiresAt: log.context?.expiryDate,
                    guardianId: log.context?.guardianId,
                    purpose: log.context?.purpose || 'General data processing'
                };

                consentRecords.push(record);
            }
        }

        return consentRecords;
    }

    private findLatestConsent(
        consentRecords: ConsentRecord[],
        consentType: ConsentType
    ): ConsentRecord | null {
        const relevantConsents = consentRecords
            .filter(record => record.consentType === consentType)
            .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());

        return relevantConsents.length > 0 ? relevantConsents[0] : null;
    }

    private isConsentExpired(consent: ConsentRecord): boolean {
        if (!consent.expiresAt) {
            return false; // No expiry date means consent doesn't expire
        }

        return new Date() > consent.expiresAt;
    }

    private verifyGuardianCustody(
        custodyHistory: any[],
        guardianId: string,
        minorId: string
    ): boolean {
        // Find the latest custody record for this guardian
        const relevantRecords = custodyHistory
            .filter(record =>
                record.context?.guardianId === guardianId &&
                record.context?.minorId === minorId
            )
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (relevantRecords.length === 0) {
            return false;
        }

        const latestRecord = relevantRecords[0];
        return latestRecord.actionType === 'custody.added';
    }

    private mapConsentType(contextType: string): ConsentType {
        switch (contextType) {
            case 'photo_video':
                return ConsentType.PHOTO_VIDEO;
            case 'data_processing':
                return ConsentType.DATA_PROCESSING;
            case 'marketing':
                return ConsentType.MARKETING;
            case 'medical':
                return ConsentType.MEDICAL;
            default:
                return ConsentType.DATA_PROCESSING;
        }
    }

    private calculateAge(dateOfBirth: Date): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    private async logConsentVerification(
        userId: string,
        fileId: string,
        tenantId: string,
        hasConsent: boolean,
        requiredConsentTypes: ConsentType[],
        reason: string
    ): Promise<void> {
        try {
            await this.auditVaultService.createAuditLog(
                tenantId,
                userId,
                hasConsent ? 'consent.verified' : 'consent.denied',
                'consent' as any,
                hasConsent ? 'low' : 'medium' as any,
                'media_file',
                fileId,
                {
                    requiredConsentTypes,
                    hasConsent,
                    reason
                }
            );
        } catch (error) {
            logger.error('Failed to log consent verification', { error });
        }
    }
}