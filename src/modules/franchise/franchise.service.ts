import { Franchise, RoyaltyCalculation, FranchisePL, FranchiseContract } from './franchise.model';
import {
    IFranchise,
    ICreateFranchiseRequest,
    ICalculateRoyaltyRequest,
    IGeneratePLRequest,
    IFranchiseSummary,
    IFranchiseDashboard,
    RoyaltyType
} from './franchise.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class FranchiseService {
    // Create Franchise
    async createFranchise(data: ICreateFranchiseRequest, userId: string): Promise<IFranchise> {
        try {
            const franchiseId = uuidv4();

            const franchise = new Franchise({
                franchiseId,
                franchiseName: data.franchiseName,
                legalEntityName: data.legalEntityName,
                brandName: data.brandName,
                franchiseeInfo: data.franchiseeInfo,
                contractInfo: data.contractInfo,
                financialTerms: data.financialTerms,
                businessUnitId: 'bu-001',
                regionId: 'reg-001',
                countryId: 'country-001',
                createdBy: userId,
                updatedBy: userId
            });

            return await franchise.save();
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to create franchise', 500);
        }
    }

    // Calculate Royalty
    async calculateRoyalty(data: ICalculateRoyaltyRequest, userId: string): Promise<any> {
        try {
            const franchise = await Franchise.findOne({ franchiseId: data.franchiseId });
            if (!franchise) {
                throw new AppError('Franchise not found', 404);
            }

            const calculationId = uuidv4();
            const deductions: Record<string, number> = data.deductions || { refunds: 0, discounts: 0, chargebacks: 0, other: 0 };
            const totalDeductions = Object.values(deductions).reduce((sum: number, val: number) => sum + val, 0);
            const netRevenue = data.grossRevenue - totalDeductions;

            let royaltyAmount = 0;
            const { royaltyType, royaltyRate, royaltyFixedAmount, royaltyTiers, minimumRoyalty } = franchise.financialTerms;

            if (royaltyType === RoyaltyType.PERCENTAGE && royaltyRate) {
                royaltyAmount = netRevenue * (royaltyRate / 100);
            } else if (royaltyType === RoyaltyType.FIXED && royaltyFixedAmount) {
                royaltyAmount = royaltyFixedAmount;
            } else if (royaltyType === RoyaltyType.TIERED && royaltyTiers) {
                const tier = royaltyTiers.find(t => netRevenue >= t.minRevenue && netRevenue <= t.maxRevenue);
                if (tier) {
                    royaltyAmount = netRevenue * (tier.rate / 100);
                }
            }

            const actualRoyalty = minimumRoyalty ? Math.max(royaltyAmount, minimumRoyalty) : royaltyAmount;
            const marketingFee = netRevenue * (franchise.financialTerms.marketingFeeRate / 100);
            const technologyFee = netRevenue * (franchise.financialTerms.technologyFeeRate / 100);
            const totalAdditionalFees = marketingFee + technologyFee;
            const totalAmountDue = actualRoyalty + totalAdditionalFees;

            const dueDate = new Date(data.periodEnd);
            dueDate.setDate(dueDate.getDate() + franchise.financialTerms.paymentDueDay);

            const calculation = new RoyaltyCalculation({
                calculationId,
                franchiseId: data.franchiseId,
                franchiseName: franchise.franchiseName,
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
                periodType: 'monthly',
                revenueBreakdown: {
                    grossRevenue: data.grossRevenue,
                    deductions,
                    netRevenue
                },
                royaltyCalculation: {
                    royaltyType,
                    royaltyRate,
                    royaltyAmount,
                    minimumRoyalty,
                    actualRoyalty
                },
                additionalFees: {
                    marketingFee,
                    technologyFee,
                    otherFees: [],
                    totalAdditionalFees
                },
                totalAmountDue,
                dueDate,
                businessUnitId: franchise.businessUnitId,
                createdBy: userId,
                updatedBy: userId
            });

            return await calculation.save();
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to calculate royalty', 500);
        }
    }

    // Generate P&L
    async generatePL(data: IGeneratePLRequest, userId: string): Promise<any> {
        try {
            const franchise = await Franchise.findOne({ franchiseId: data.franchiseId });
            if (!franchise) {
                throw new AppError('Franchise not found', 404);
            }

            const plId = uuidv4();

            // Mock data - in real implementation, aggregate from actual transactions
            const revenue = {
                membershipFees: 50000,
                programFees: 30000,
                eventFees: 10000,
                merchandiseSales: 5000,
                otherRevenue: 5000,
                totalRevenue: 100000
            };

            const cogs = {
                instructorCosts: 20000,
                facilityCosts: 10000,
                equipmentCosts: 5000,
                materialCosts: 3000,
                totalCOGS: 38000
            };

            const grossProfit = revenue.totalRevenue - cogs.totalCOGS;
            const grossMargin = (grossProfit / revenue.totalRevenue) * 100;

            const operatingExpenses = {
                salaries: 15000,
                rent: 8000,
                utilities: 2000,
                marketing: 5000,
                insurance: 2000,
                maintenance: 1000,
                technology: 1500,
                administrative: 2500,
                otherExpenses: 1000,
                totalOperatingExpenses: 38000
            };

            const franchiseFees = {
                royaltyFees: 6000,
                marketingFees: 2000,
                technologyFees: 1000,
                otherFees: 0,
                totalFranchiseFees: 9000
            };

            const ebitda = grossProfit - operatingExpenses.totalOperatingExpenses - franchiseFees.totalFranchiseFees;
            const ebitdaMargin = (ebitda / revenue.totalRevenue) * 100;

            const netProfit = ebitda;
            const netMargin = (netProfit / revenue.totalRevenue) * 100;

            const pl = new FranchisePL({
                plId,
                franchiseId: data.franchiseId,
                franchiseName: franchise.franchiseName,
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
                periodType: 'monthly',
                revenue,
                cogs,
                grossProfit,
                grossMargin,
                operatingExpenses,
                franchiseFees,
                ebitda,
                ebitdaMargin,
                netProfit,
                netMargin,
                keyMetrics: {
                    revenuePerMember: revenue.totalRevenue / (franchise.performanceMetrics.activeMembers || 1),
                    costPerMember: (cogs.totalCOGS + operatingExpenses.totalOperatingExpenses) / (franchise.performanceMetrics.activeMembers || 1),
                    profitPerMember: netProfit / (franchise.performanceMetrics.activeMembers || 1),
                    breakEvenPoint: (operatingExpenses.totalOperatingExpenses + franchiseFees.totalFranchiseFees) / grossMargin * 100,
                    cashFlow: netProfit
                },
                comparisons: {
                    previousPeriodRevenue: 95000,
                    revenueGrowth: 5.26,
                    previousPeriodProfit: 13000,
                    profitGrowth: 15.38
                },
                businessUnitId: franchise.businessUnitId,
                createdBy: userId,
                updatedBy: userId
            });

            return await pl.save();
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to generate P&L', 500);
        }
    }

    // Get Franchise Summary
    async getFranchiseSummary(franchiseId: string): Promise<IFranchiseSummary> {
        const franchise = await Franchise.findOne({ franchiseId });
        if (!franchise) {
            throw new AppError('Franchise not found', 404);
        }

        return {
            franchiseId: franchise.franchiseId,
            franchiseName: franchise.franchiseName,
            status: franchise.status,
            totalLocations: franchise.locations.length,
            totalRevenue: franchise.performanceMetrics.totalRevenue,
            totalRoyaltiesPaid: franchise.performanceMetrics.totalRoyaltiesPaid,
            activeMembers: franchise.performanceMetrics.activeMembers,
            complianceScore: franchise.performanceMetrics.complianceScore,
            contractExpiryDate: franchise.contractInfo.expirationDate
        };
    }

    // Get Franchise Dashboard
    async getFranchiseDashboard(franchiseId: string): Promise<IFranchiseDashboard> {
        const franchise = await Franchise.findOne({ franchiseId });
        if (!franchise) {
            throw new AppError('Franchise not found', 404);
        }

        return {
            franchiseId: franchise.franchiseId,
            franchiseName: franchise.franchiseName,
            overview: {
                status: franchise.status,
                activeSince: franchise.activationDate || new Date(),
                totalLocations: franchise.locations.length,
                totalMembers: franchise.performanceMetrics.activeMembers
            },
            financial: {
                currentMonthRevenue: franchise.performanceMetrics.averageMonthlyRevenue,
                lastMonthRevenue: franchise.performanceMetrics.averageMonthlyRevenue * 0.95,
                revenueGrowth: franchise.performanceMetrics.revenueGrowthRate,
                outstandingRoyalties: 0,
                nextPaymentDue: new Date()
            },
            performance: {
                complianceScore: franchise.performanceMetrics.complianceScore,
                memberSatisfaction: 85,
                revenuePerLocation: franchise.performanceMetrics.totalRevenue / (franchise.locations.length || 1),
                profitMargin: 15
            },
            alerts: []
        };
    }

    // Get All Franchises
    async getAllFranchises(): Promise<IFranchise[]> {
        return await Franchise.find();
    }

    // Update Franchise
    async updateFranchise(franchiseId: string, data: Partial<IFranchise>, userId: string): Promise<IFranchise | null> {
        const franchise = await Franchise.findOneAndUpdate(
            { franchiseId },
            { ...data, updatedBy: userId },
            { new: true }
        );

        if (!franchise) {
            throw new AppError('Franchise not found', 404);
        }

        return franchise;
    }
}
