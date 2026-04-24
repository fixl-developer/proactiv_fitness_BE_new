import { WhiteLabelPlatformService } from './white-label-platform.service';

describe('WhiteLabelPlatformService', () => {
    let service: WhiteLabelPlatformService;

    beforeEach(() => {
        service = new WhiteLabelPlatformService();
    });

    describe('onboardTenant', () => {
        it('should onboard a new tenant', async () => {
            const tenant = await service.onboardTenant({
                name: 'Test Gym',
                email: 'gym@example.com',
                contactPerson: 'John Doe',
                phone: '1234567890'
            });
            expect(tenant).toBeDefined();
            expect(tenant.name).toBe('Test Gym');
            expect(tenant.tenantId).toBeDefined();
        });
    });

    describe('updateTenantBranding', () => {
        it('should update tenant branding', async () => {
            const tenant = await service.onboardTenant({
                name: 'Test Gym',
                email: 'gym@example.com'
            });
            const branding = await service.updateTenantBranding(tenant.tenantId, {
                logo: 'https://example.com/logo.png',
                primaryColor: '#FF0000',
                secondaryColor: '#00FF00'
            });
            expect(branding).toBeDefined();
            expect(branding.primaryColor).toBe('#FF0000');
        });
    });

    describe('getTenantAnalytics', () => {
        it('should get tenant analytics', async () => {
            const tenant = await service.onboardTenant({
                name: 'Test Gym',
                email: 'gym@example.com'
            });
            const analytics = await service.getTenantAnalytics(tenant.tenantId);
            expect(analytics).toBeDefined();
            expect(analytics.totalUsers).toBeGreaterThanOrEqual(0);
        });
    });

    describe('setUsageBasedPricing', () => {
        it('should set usage-based pricing', async () => {
            const tenant = await service.onboardTenant({
                name: 'Test Gym',
                email: 'gym@example.com'
            });
            const pricing = await service.setUsageBasedPricing(tenant.tenantId, {
                basePrice: 500,
                pricePerUser: 10,
                pricePerTransaction: 0.5,
                pricePerAPI: 0.01
            });
            expect(pricing).toBeDefined();
            expect(pricing.basePrice).toBe(500);
        });
    });
});
