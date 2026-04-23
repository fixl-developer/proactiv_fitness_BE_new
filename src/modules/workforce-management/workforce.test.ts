// Workforce Management Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorkforceService } from './workforce.service';
import { WorkforceController } from './workforce.controller';
import { Request, Response } from 'express';

describe('Workforce Management Module', () => {
    let service: WorkforceService;
    let controller: WorkforceController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        service = new WorkforceService();
        controller = new WorkforceController();

        mockRequest = {
            user: { id: 'admin-123' },
            params: {},
            body: {},
            query: {}
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Staff Profile Management', () => {
        it('should create staff profile', async () => {
            const staffData = {
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            };

            const result = await service.createStaffProfile(staffData);

            expect(result).toBeDefined();
            expect(result.name).toBe('John Coach');
            expect(result.status).toBe('active');
        });

        it('should get staff profile', async () => {
            const staffData = {
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            };

            const created = await service.createStaffProfile(staffData);
            const profile = await service.getStaffProfile(created.staffId);

            expect(profile.staffId).toBe(created.staffId);
            expect(profile.name).toBe('John Coach');
        });

        it('should update staff profile', async () => {
            const staffData = {
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            };

            const created = await service.createStaffProfile(staffData);
            const updated = await service.updateStaffProfile(created.staffId, { status: 'on_leave' });

            expect(updated.status).toBe('on_leave');
        });

        it('should list staff profiles', async () => {
            await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const profiles = await service.listStaffProfiles();

            expect(Array.isArray(profiles)).toBe(true);
            expect(profiles.length).toBeGreaterThan(0);
        });
    });

    describe('Certification Management', () => {
        it('should add certification', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const cert = await service.addCertification(staff.staffId, {
                certificationName: 'CPR Certification',
                issueDate: new Date('2024-01-15'),
                expiryDate: new Date('2026-01-15'),
                documentUrl: 'https://example.com/cert.pdf'
            });

            expect(cert).toBeDefined();
            expect(cert.certificationName).toBe('CPR Certification');
            expect(cert.status).toBe('active');
        });

        it('should get certifications', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            await service.addCertification(staff.staffId, {
                certificationName: 'CPR Certification',
                issueDate: new Date('2024-01-15'),
                expiryDate: new Date('2026-01-15'),
                documentUrl: 'https://example.com/cert.pdf'
            });

            const certs = await service.getCertifications(staff.staffId);

            expect(Array.isArray(certs)).toBe(true);
            expect(certs.length).toBe(1);
        });

        it('should get expiring certifications', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 15);

            await service.addCertification(staff.staffId, {
                certificationName: 'CPR Certification',
                issueDate: new Date('2024-01-15'),
                expiryDate: futureDate,
                documentUrl: 'https://example.com/cert.pdf'
            });

            const expiring = await service.getExpiringCertifications(30);

            expect(expiring.length).toBeGreaterThan(0);
        });
    });

    describe('Leave Management', () => {
        it('should request leave', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const leave = await service.requestLeave(staff.staffId, {
                leaveType: 'vacation' as const,
                startDate: new Date('2026-04-01'),
                endDate: new Date('2026-04-05'),
                reason: 'Family vacation'
            });

            expect(leave).toBeDefined();
            expect(leave.status).toBe('pending');
        });

        it('should approve leave request', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const leave = await service.requestLeave(staff.staffId, {
                leaveType: 'vacation' as const,
                startDate: new Date('2026-04-01'),
                endDate: new Date('2026-04-05'),
                reason: 'Family vacation'
            });

            const approved = await service.approveLeaveRequest(leave.leaveRequestId, 'manager-001');

            expect(approved.status).toBe('approved');
            expect(approved.approvedBy).toBe('manager-001');
        });

        it('should reject leave request', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const leave = await service.requestLeave(staff.staffId, {
                leaveType: 'vacation' as const,
                startDate: new Date('2026-04-01'),
                endDate: new Date('2026-04-05'),
                reason: 'Family vacation'
            });

            const rejected = await service.rejectLeaveRequest(leave.leaveRequestId, 'Insufficient coverage');

            expect(rejected.status).toBe('rejected');
            expect(rejected.rejectionReason).toBe('Insufficient coverage');
        });

        it('should get leave balance', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const balance = await service.getLeaveBalance(staff.staffId, 2026);

            expect(balance).toBeDefined();
            expect(balance.sickLeave).toBe(10);
            expect(balance.vacationLeave).toBe(20);
        });
    });

    describe('Time Tracking', () => {
        it('should log time tracking', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const tracking = await service.logTimeTracking(staff.staffId, {
                date: new Date('2026-03-11'),
                scheduledHours: 8,
                actualHours: 8.5,
                checkInTime: new Date('2026-03-11T09:00:00Z'),
                checkOutTime: new Date('2026-03-11T17:30:00Z'),
                breakTime: 0.5,
                status: 'present' as const
            });

            expect(tracking).toBeDefined();
            expect(tracking.overtimeHours).toBe(0.5);
        });

        it('should create timesheet', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            await service.logTimeTracking(staff.staffId, {
                date: new Date('2026-03-11'),
                scheduledHours: 8,
                actualHours: 8,
                checkInTime: new Date('2026-03-11T09:00:00Z'),
                checkOutTime: new Date('2026-03-11T17:00:00Z'),
                breakTime: 0,
                status: 'present' as const
            });

            const timesheet = await service.createTimesheet(
                staff.staffId,
                'monthly',
                new Date('2026-03-01'),
                new Date('2026-03-31')
            );

            expect(timesheet).toBeDefined();
            expect(timesheet.status).toBe('draft');
        });
    });

    describe('Performance Management', () => {
        it('should create performance KPI', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const kpi = await service.createPerformanceKPI(staff.staffId, {
                period: 'monthly' as const,
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-03-31'),
                utilization: 85,
                attendanceQuality: 95,
                parentFeedback: 90,
                skillsScore: 88
            });

            expect(kpi).toBeDefined();
            expect(kpi.overallScore).toBeGreaterThan(0);
        });

        it('should get performance KPIs', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            await service.createPerformanceKPI(staff.staffId, {
                period: 'monthly' as const,
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-03-31'),
                utilization: 85,
                attendanceQuality: 95,
                parentFeedback: 90,
                skillsScore: 88
            });

            const kpis = await service.getPerformanceKPIs(staff.staffId);

            expect(Array.isArray(kpis)).toBe(true);
            expect(kpis.length).toBeGreaterThan(0);
        });
    });

    describe('Payroll Management', () => {
        it('should create payroll', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const payroll = await service.createPayroll(staff.staffId, {
                period: 'monthly' as const,
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-03-31'),
                baseSalary: 5000,
                overtimePay: 250,
                bonuses: 500,
                deductions: 800,
                paymentMethod: 'bank_transfer' as const
            });

            expect(payroll).toBeDefined();
            expect(payroll.netSalary).toBe(4950);
        });

        it('should export payroll', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            await service.createPayroll(staff.staffId, {
                period: 'monthly' as const,
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-03-31'),
                baseSalary: 5000,
                overtimePay: 250,
                bonuses: 500,
                deductions: 800,
                paymentMethod: 'bank_transfer' as const
            });

            const export_ = await service.exportPayroll(
                'monthly',
                new Date('2026-03-01'),
                new Date('2026-03-31'),
                'xero'
            );

            expect(export_).toBeDefined();
            expect(export_.status).toBe('completed');
        });
    });

    describe('Training & Development', () => {
        it('should add training record', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const training = await service.addTrainingRecord(staff.staffId, {
                trainingName: 'Advanced Gymnastics Coaching',
                trainingType: 'required' as const
            });

            expect(training).toBeDefined();
            expect(training.status).toBe('not_started');
        });

        it('should create development plan', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const plan = await service.createDevelopmentPlan(staff.staffId, 2026, {
                goals: [
                    {
                        title: 'Improve coaching skills',
                        description: 'Complete advanced coaching certification',
                        targetDate: new Date('2026-12-31')
                    }
                ]
            });

            expect(plan).toBeDefined();
            expect(plan.status).toBe('active');
        });
    });

    describe('Location Assignment', () => {
        it('should assign location', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const assignment = await service.assignLocation(staff.staffId, {
                locationId: 'location-1',
                locationName: 'Downtown Center',
                role: 'Head Coach',
                startDate: new Date('2026-03-15'),
                isPrimary: true,
                hoursPerWeek: 40
            });

            expect(assignment).toBeDefined();
            expect(assignment.status).toBe('active');
        });

        it('should get location assignments', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            await service.assignLocation(staff.staffId, {
                locationId: 'location-1',
                locationName: 'Downtown Center',
                role: 'Head Coach',
                startDate: new Date('2026-03-15'),
                isPrimary: true,
                hoursPerWeek: 40
            });

            const assignments = await service.getLocationAssignments(staff.staffId);

            expect(Array.isArray(assignments)).toBe(true);
            expect(assignments.length).toBeGreaterThan(0);
        });
    });

    describe('Notifications', () => {
        it('should send notification', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const notif = await service.sendNotification(staff.staffId, {
                type: 'certification_expiry' as const,
                title: 'Certification Expiring Soon',
                message: 'Your CPR certification expires on 2026-04-15'
            });

            expect(notif).toBeDefined();
            expect(notif.read).toBe(false);
        });

        it('should get notifications', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            await service.sendNotification(staff.staffId, {
                type: 'certification_expiry' as const,
                title: 'Certification Expiring Soon',
                message: 'Your CPR certification expires on 2026-04-15'
            });

            const notifs = await service.getNotifications(staff.staffId);

            expect(Array.isArray(notifs)).toBe(true);
            expect(notifs.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('should throw error for non-existent staff', async () => {
            expect(async () => {
                await service.getStaffProfile('non-existent');
            }).rejects.toThrow();
        });

        it('should throw error for non-existent leave request', async () => {
            expect(async () => {
                await service.approveLeaveRequest('non-existent', 'manager-001');
            }).rejects.toThrow();
        });
    });

    describe('Data Validation', () => {
        it('should validate staff position', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            expect(['coach', 'manager', 'admin', 'trainer']).toContain(staff.position);
        });

        it('should validate leave type', async () => {
            const staff = await service.createStaffProfile({
                name: 'John Coach',
                email: 'john@example.com',
                phone: '+1234567890',
                position: 'coach' as const,
                department: 'Gymnastics'
            });

            const leave = await service.requestLeave(staff.staffId, {
                leaveType: 'vacation' as const,
                startDate: new Date('2026-04-01'),
                endDate: new Date('2026-04-05'),
                reason: 'Family vacation'
            });

            expect(['sick', 'vacation', 'personal', 'unpaid', 'maternity', 'paternity']).toContain(leave.leaveType);
        });
    });
});
