import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';
import { v4 as uuidv4 } from 'uuid';
import GlobalIntelligenceModel from './model';

export class GlobalIntelligenceService {
  // ─── 1. Cross-Location Benchmarking ────────────────────────────
  async getBenchmarks(tenantId: string) {
    try {
      const prompt = {
        system: `You are a multi-location fitness business intelligence AI. RESPOND ONLY with valid JSON: {
          "locations": [{ "locationId": "string", "locationName": "string", "metrics": { "revenue": 0, "retention": 0, "enrollment": 0, "satisfaction": 0 }, "rank": 0 }],
          "topPerformers": ["locationName"],
          "underPerformers": ["locationName"],
          "insights": "string"
        }`,
        user: `Generate cross-location benchmark analysis for tenant ${tenantId}. Compare performance across all locations on revenue, member retention rate (%), enrollment numbers, and satisfaction scores (1-10). Rank locations and provide actionable insights about performance gaps.`,
      };

      const result = await aiService.jsonCompletion<{
        locations: Array<{ locationId: string; locationName: string; metrics: { revenue: number; retention: number; enrollment: number; satisfaction: number }; rank: number }>;
        topPerformers: string[];
        underPerformers: string[];
        insights: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'global-intelligence',
        temperature: 0.5,
      });

      const record = await GlobalIntelligenceModel.create({
        intelligenceId: uuidv4(),
        tenantId,
        type: 'BENCHMARK',
        benchmarks: result,
      });

      logger.info(`Global Intelligence: Benchmarks generated for ${result.locations.length} locations`);

      return {
        intelligenceId: record.intelligenceId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Global Intelligence getBenchmarks failed:', error.message);
      return {
        intelligenceId: uuidv4(),
        locations: [
          { locationId: 'loc-1', locationName: 'Main Branch', metrics: { revenue: 150000, retention: 82, enrollment: 320, satisfaction: 8.2 }, rank: 1 },
          { locationId: 'loc-2', locationName: 'Downtown Branch', metrics: { revenue: 120000, retention: 75, enrollment: 250, satisfaction: 7.5 }, rank: 2 },
        ],
        topPerformers: ['Main Branch'],
        underPerformers: ['Downtown Branch'],
        insights: 'Fallback: Main Branch leads across all metrics. Downtown Branch has room for improvement in retention and satisfaction.',
        aiPowered: false,
      };
    }
  }

  // ─── 2. Identify Transferable Best Practices ───────────────────
  async getBestPractices(tenantId: string) {
    try {
      const prompt = {
        system: `You are a best practices identification AI for multi-location fitness businesses. RESPOND ONLY with valid JSON: {
          "bestPractices": [{ "sourceLocationId": "string", "practice": "string", "category": "string", "impact": "high|medium|low", "applicability": 0.0-1.0, "implementationSteps": ["string"] }]
        }`,
        user: `Identify transferable best practices across all locations for tenant ${tenantId}. Analyze what top-performing locations do differently in operations, member engagement, staff management, marketing, and retention. Provide specific implementation steps for each practice.`,
      };

      const result = await aiService.jsonCompletion<{
        bestPractices: Array<{ sourceLocationId: string; practice: string; category: string; impact: string; applicability: number; implementationSteps: string[] }>;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'global-intelligence',
        temperature: 0.6,
      });

      const record = await GlobalIntelligenceModel.create({
        intelligenceId: uuidv4(),
        tenantId,
        type: 'BEST_PRACTICE',
        bestPractices: result.bestPractices,
      });

      logger.info(`Global Intelligence: ${result.bestPractices.length} best practices identified`);

      return {
        intelligenceId: record.intelligenceId,
        bestPractices: result.bestPractices,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Global Intelligence getBestPractices failed:', error.message);
      return {
        intelligenceId: uuidv4(),
        bestPractices: [
          {
            sourceLocationId: 'loc-1',
            practice: 'Personalized onboarding program with 30-day check-in cadence',
            category: 'Member Retention',
            impact: 'high',
            applicability: 0.9,
            implementationSteps: [
              'Create standardized onboarding checklist',
              'Train staff on personal follow-up protocols',
              'Set up automated 7/14/30 day check-in reminders',
            ],
          },
        ],
        aiPowered: false,
      };
    }
  }

  // ─── 3. Global Demand/Revenue Forecast ─────────────────────────
  async getGlobalForecast(tenantId: string) {
    try {
      const prompt = {
        system: `You are a financial forecasting AI for multi-location fitness businesses. RESPOND ONLY with valid JSON: {
          "totalRevenueProjection": 0,
          "enrollmentProjection": 0,
          "growthRate": 0.0,
          "byRegion": [{ "region": "string", "revenue": 0, "growth": 0.0 }],
          "risks": ["string"],
          "opportunities": ["string"]
        }`,
        user: `Generate a global forecast for tenant ${tenantId}. Project total revenue, enrollment growth, and regional breakdowns for the next 12 months. Consider seasonal trends in fitness (New Year surge, summer slowdown), market conditions, and growth trajectories. Identify key risks and opportunities.`,
      };

      const result = await aiService.jsonCompletion<{
        totalRevenueProjection: number;
        enrollmentProjection: number;
        growthRate: number;
        byRegion: Array<{ region: string; revenue: number; growth: number }>;
        risks: string[];
        opportunities: string[];
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'global-intelligence',
        temperature: 0.5,
      });

      const record = await GlobalIntelligenceModel.create({
        intelligenceId: uuidv4(),
        tenantId,
        type: 'GLOBAL_FORECAST',
        globalForecast: result,
      });

      logger.info(`Global Intelligence: Forecast generated - projected revenue $${result.totalRevenueProjection}`);

      return {
        intelligenceId: record.intelligenceId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Global Intelligence getGlobalForecast failed:', error.message);
      return {
        intelligenceId: uuidv4(),
        totalRevenueProjection: 1800000,
        enrollmentProjection: 1500,
        growthRate: 12.5,
        byRegion: [
          { region: 'North', revenue: 600000, growth: 15.0 },
          { region: 'Central', revenue: 750000, growth: 10.0 },
          { region: 'South', revenue: 450000, growth: 13.0 },
        ],
        risks: [
          'Seasonal enrollment dip in summer months',
          'Rising operational costs',
          'Increased local competition',
        ],
        opportunities: [
          'Corporate wellness partnerships',
          'Digital/hybrid membership offerings',
          'Youth program expansion',
        ],
        aiPowered: false,
      };
    }
  }

  // ─── 4. Resource Allocation Optimization ───────────────────────
  async optimizeResources(data: {
    tenantId: string;
    locations: Array<{
      locationId: string;
      locationName: string;
      currentResources: Record<string, number>;
      utilization: number;
    }>;
    budget?: number;
  }) {
    try {
      const prompt = {
        system: `You are a resource optimization AI for multi-location fitness businesses. RESPOND ONLY with valid JSON: {
          "suggestions": [{ "locationId": "string", "resource": "string", "currentAllocation": 0, "suggestedAllocation": 0, "reasoning": "string" }],
          "totalSavings": 0
        }`,
        user: `Optimize resource allocation across locations for tenant ${data.tenantId}.
Location data:
${JSON.stringify(data.locations, null, 2)}
Budget constraint: ${data.budget ? `$${data.budget}` : 'flexible'}
Analyze utilization rates and suggest reallocation of staff, equipment, and budget to maximize efficiency and ROI.`,
      };

      const result = await aiService.jsonCompletion<{
        suggestions: Array<{ locationId: string; resource: string; currentAllocation: number; suggestedAllocation: number; reasoning: string }>;
        totalSavings: number;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'global-intelligence',
        temperature: 0.5,
      });

      const record = await GlobalIntelligenceModel.create({
        intelligenceId: uuidv4(),
        tenantId: data.tenantId,
        type: 'RESOURCE_OPTIMIZATION',
        resourceOptimization: result,
      });

      logger.info(`Global Intelligence: Resource optimization - potential savings $${result.totalSavings}`);

      return {
        intelligenceId: record.intelligenceId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Global Intelligence optimizeResources failed:', error.message);
      return {
        intelligenceId: uuidv4(),
        suggestions: [
          {
            locationId: 'loc-1',
            resource: 'Staff hours',
            currentAllocation: 480,
            suggestedAllocation: 440,
            reasoning: 'Fallback: Off-peak hours show low utilization, reduce by 8%',
          },
        ],
        totalSavings: 5000,
        aiPowered: false,
      };
    }
  }

  // ─── 5. Market Expansion Analysis ──────────────────────────────
  async getExpansionOpportunities(tenantId: string) {
    try {
      const prompt = {
        system: `You are a market expansion intelligence AI for fitness businesses. RESPOND ONLY with valid JSON: {
          "opportunities": [{ "market": "string", "demandScore": 0-100, "competitionLevel": "low|medium|high", "estimatedRevenue": 0, "roi": 0.0, "risks": ["string"] }],
          "recommendations": ["string"]
        }`,
        user: `Analyze market expansion opportunities for tenant ${tenantId}. Evaluate potential new markets based on demographic demand, competition landscape, estimated revenue potential, projected ROI, and associated risks. Provide strategic recommendations for expansion priority.`,
      };

      const result = await aiService.jsonCompletion<{
        opportunities: Array<{ market: string; demandScore: number; competitionLevel: string; estimatedRevenue: number; roi: number; risks: string[] }>;
        recommendations: string[];
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'global-intelligence',
        temperature: 0.6,
      });

      const record = await GlobalIntelligenceModel.create({
        intelligenceId: uuidv4(),
        tenantId,
        type: 'EXPANSION',
        expansionIntelligence: result,
      });

      logger.info(`Global Intelligence: ${result.opportunities.length} expansion opportunities identified`);

      return {
        intelligenceId: record.intelligenceId,
        ...result,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('Global Intelligence getExpansionOpportunities failed:', error.message);
      return {
        intelligenceId: uuidv4(),
        opportunities: [
          {
            market: 'Suburban West District',
            demandScore: 72,
            competitionLevel: 'medium',
            estimatedRevenue: 250000,
            roi: 1.8,
            risks: ['Higher rental costs', 'Established local competitors'],
          },
        ],
        recommendations: [
          'Prioritize markets with demand score above 70 and low competition',
          'Consider franchise model for faster expansion',
          'Start with pop-up events to test market demand before committing',
        ],
        aiPowered: false,
      };
    }
  }
}

export default new GlobalIntelligenceService();
