import { Partner, BulkImport } from './partner.model';
import { IPartner, ICreatePartnerRequest, IBulkImportRequest, IPartnerDashboard } from './partner.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class PartnerService {
    async createPartner(data: ICreatePartnerRequest, userId: string): Promise<IPartner> {
        const partnerId = uuidv4();

        const partner = new Partner({
            partnerId,
            partnerName: data.partnerName,
            partnerType: data.partnerType,
            legalEntityName: data.legalEntityName,
            contactInfo: data.contactInfo,
            revenueShare: data.revenueShare,
            businessUnitId: 'bu-001',
            locationId: 'loc-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await partner.save();
    }

    async bulkImportStudents(data: IBulkImportRequest, userId: string): Promise<any> {
        const importId = uuidv4();
        const partner = await Partner.findOne({ partnerId: data.partnerId });

        if (!partner) {
            throw new AppError('Partner not found', 404);
        }

        const bulkImport = new BulkImport({
            importId,
            partnerId: data.partnerId,
            partnerName: partner.partnerName,
            importedBy: userId,
            fileInfo: {
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                fileSize: 0,
                recordCount: 0
            },
            businessUnitId: partner.businessUnitId,
            createdBy: userId,
            updatedBy: userId
        });

        return await bulkImport.save();
    }

    async getPartnerDashboard(partnerId: string): Promise<IPartnerDashboard> {
        const partner = await Partner.findOne({ partnerId });

        if (!partner) {
            throw new AppError('Partner not found', 404);
        }

        return {
            partnerId: partner.partnerId,
            partnerName: partner.partnerName,
            overview: {
                status: partner.status,
                totalStudents: partner.studentInfo.totalStudents,
                activeStudents: partner.studentInfo.activeStudents,
                enrolledPrograms: partner.studentInfo.enrolledPrograms.length
            },
            financial: {
                totalRevenue: partner.financialMetrics.totalRevenue,
                partnerShare: partner.financialMetrics.partnerRevenue,
                platformShare: partner.financialMetrics.platformRevenue,
                lastPaymentDate: undefined,
                nextPaymentDate: undefined
            },
            performance: {
                studentGrowthRate: 0,
                revenueGrowthRate: 0,
                complianceScore: partner.complianceInfo.complianceScore
            }
        };
    }

    async getAllPartners(): Promise<IPartner[]> {
        return await Partner.find();
    }
}