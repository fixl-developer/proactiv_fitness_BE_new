// Workforce Management Service - Business Logic

import { IStaffProfile, ICertification, ILeaveRequest, ILeaveBalance, ITimeTracking, ITimesheet, IPerformanceKPI, IPayroll, ITrainingRecord, IDevelopmentPlan, ILocationAssignment, IStaffPerformanceMetrics, IPayrollExport, IStaffAttendance, IBackgroundCheck, IStaffNotification, IWorkforceAnalytics } from './workforce.model';

export class WorkforceService {
    private staffProfiles: Map<string, IStaffProfile> = new Map();
    private certifications: Map<string, ICertification[]> = new Map();
    private leaveRequests: Map<string, ILeaveRequest[]> = new Map();
    private leaveBalances: Map<string, ILeaveBalance> = new Map();
    private timeTracking: Map<string, ITimeTracking[]> = new Map();
    private timesheets: Map<string, ITimesheet[]> = new Map();
    private performanceKPIs: Map<string, IPerformanceKPI[]> = new Map();
    private payrolls: Map<string, IPayroll[]> = new Map();
    private trainingRecords: Map<string, ITrainingRecord[]> = new Map();
    private developmentPlans: Map<string, IDevelopmentPlan> = new Map();
    private locationAssignments: Map<string, ILocationAssignment[]> = new Map();
    private performanceMetrics: Map<string, IStaffPerformanceMetrics[]> = new Map();
    private notifications: Map<string, IStaffNotification[]> = new Map();

    // ==================== Staff Profile Management ====================

    async createStaffProfile(staffData: Partial<IStaffProfile>): Promise<IStaffProfile> {
        const profile: IStaffProfile = {
            staffId: `staff-${Date.now()}`,
            name: staffData.name || '',
            email: staffData.email || '',
            phone: staffData.phone || '',
            position: staffData.position || 'coach',
            department: staffData.department || '',
            joinDate: staffData.joinDate || new Date(),
            backgroundCheckStatus: 'pending',
            certifications: [],
            locations: [],
            availability: staffData.availability || this.getDefaultAvailability(),
            documents: [],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.staffProfiles.set(profile.staffId, profile);
        return profile;
    }

    async getStaffProfile(staffId: string): Promise<IStaffProfile> {
        const profile = this.staffProfiles.get(staffId);
        if (!profile) throw new Error('Staff profile not found');
        return profile;
    }

    async updateStaffProfile(staffId: string, updates: Partial<IStaffProfile>): Promise<IStaffProfile> {
        const profile = await this.getStaffProfile(staffId);
        const updated = { ...profile, ...updates, updatedAt: new Date() };
        this.staffProfiles.set(staffId, updated);
        return updated;
    }

    async listStaffProfiles(filters?: any): Promise<IStaffProfile[]> {
        const profiles = Array.from(this.staffProfiles.values());
        if (filters?.status) {
            return profiles.filter(p => p.status === filters.status);
        }
        return profiles;
    }

    // ==================== Certification Management ====================

    async addCertification(staffId: string, certData: Partial<ICertification>): Promise<ICertification> {
        const cert: ICertification = {
            certificationId: `cert-${Date.now()}`,
            staffId,
            certificationName: certData.certificationName || '',
            issueDate: certData.issueDate || new Date(),
            expiryDate: certData.expiryDate || new Date(),
            documentUrl: certData.documentUrl || '',
            status: 'active',
            notificationSent: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.certifications.has(staffId)) {
            this.certifications.set(staffId, []);
        }
        this.certifications.get(staffId)!.push(cert);

        // Update staff profile
        const profile = await this.getStaffProfile(staffId);
        profile.certifications.push(cert.certificationId);

        return cert;
    }

    async getCertifications(staffId: string): Promise<ICertification[]> {
        return this.certifications.get(staffId) || [];
    }

    async getExpiringCertifications(daysUntilExpiry: number = 30): Promise<ICertification[]> {
        const allCerts: ICertification[] = [];
        for (const certs of this.certifications.values()) {
            allCerts.push(...certs);
        }

        const now = new Date();
        const futureDate = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);

        return allCerts.filter(c => c.expiryDate <= futureDate && c.expiryDate >= now && c.status !== 'expired');
    }

    // ==================== Leave Management ====================

    async requestLeave(staffId: string, leaveData: Partial<ILeaveRequest>): Promise<ILeaveRequest> {
        const leave: ILeaveRequest = {
            leaveRequestId: `leave-${Date.now()}`,
            staffId,
            leaveType: leaveData.leaveType || 'vacation',
            startDate: leaveData.startDate || new Date(),
            endDate: leaveData.endDate || new Date(),
            reason: leaveData.reason || '',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.leaveRequests.has(staffId)) {
            this.leaveRequests.set(staffId, []);
        }
        this.leaveRequests.get(staffId)!.push(leave);

        return leave;
    }

    async approveLeaveRequest(leaveRequestId: string, approvedBy: string): Promise<ILeaveRequest> {
        for (const [, leaves] of this.leaveRequests) {
            const leave = leaves.find(l => l.leaveRequestId === leaveRequestId);
            if (leave) {
                leave.status = 'approved';
                leave.approvedBy = approvedBy;
                leave.approvedDate = new Date();

                // Update leave balance
                await this.updateLeaveBalance(leave.staffId, leave.leaveType, leave.startDate, leave.endDate);

                return leave;
            }
        }
        throw new Error('Leave request not found');
    }

    async rejectLeaveRequest(leaveRequestId: string, reason: string): Promise<ILeaveRequest> {
        for (const [, leaves] of this.leaveRequests) {
            const leave = leaves.find(l => l.leaveRequestId === leaveRequestId);
            if (leave) {
                leave.status = 'rejected';
                leave.rejectionReason = reason;
                return leave;
            }
        }
        throw new Error('Leave request not found');
    }

    async getLeaveRequests(staffId: string, status?: string): Promise<ILeaveRequest[]> {
        const leaves = this.leaveRequests.get(staffId) || [];
        if (status) {
            return leaves.filter(l => l.status === status);
        }
        return leaves;
    }

    async getLeaveBalance(staffId: string, year: number): Promise<ILeaveBalance> {
        const key = `${staffId}-${year}`;
        let balance = this.leaveBalances.get(key);

        if (!balance) {
            balance = {
                balanceId: `balance-${Date.now()}`,
                staffId,
                year,
                sickLeave: 10,
                vacationLeave: 20,
                personalLeave: 5,
                unpaidLeave: 0,
                maternityLeave: 90,
                paternityLeave: 10,
                usedSickLeave: 0,
                usedVacationLeave: 0,
                usedPersonalLeave: 0,
                usedUnpaidLeave: 0,
                usedMaternityLeave: 0,
                usedPaternityLeave: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.leaveBalances.set(key, balance);
        }

        return balance;
    }

    private async updateLeaveBalance(staffId: string, leaveType: string, startDate: Date, endDate: Date): Promise<void> {
        const year = startDate.getFullYear();
        const balance = await this.getLeaveBalance(staffId, year);

        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (leaveType) {
            case 'sick':
                balance.usedSickLeave += days;
                break;
            case 'vacation':
                balance.usedVacationLeave += days;
                break;
            case 'personal':
                balance.usedPersonalLeave += days;
                break;
            case 'unpaid':
                balance.usedUnpaidLeave += days;
                break;
            case 'maternity':
                balance.usedMaternityLeave += days;
                break;
            case 'paternity':
                balance.usedPaternityLeave += days;
                break;
        }
    }

    // ==================== Time Tracking ====================

    async logTimeTracking(staffId: string, trackingData: Partial<ITimeTracking>): Promise<ITimeTracking> {
        const tracking: ITimeTracking = {
            trackingId: `track-${Date.now()}`,
            staffId,
            date: trackingData.date || new Date(),
            scheduledHours: trackingData.scheduledHours || 8,
            actualHours: trackingData.actualHours || 0,
            checkInTime: trackingData.checkInTime || new Date(),
            checkOutTime: trackingData.checkOutTime || new Date(),
            breakTime: trackingData.breakTime || 0,
            overtimeHours: Math.max(0, (trackingData.actualHours || 0) - 8),
            status: trackingData.status || 'present',
            notes: trackingData.notes,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.timeTracking.has(staffId)) {
            this.timeTracking.set(staffId, []);
        }
        this.timeTracking.get(staffId)!.push(tracking);

        return tracking;
    }

    async getTimeTracking(staffId: string, startDate: Date, endDate: Date): Promise<ITimeTracking[]> {
        const tracking = this.timeTracking.get(staffId) || [];
        return tracking.filter(t => t.date >= startDate && t.date <= endDate);
    }

    async createTimesheet(staffId: string, period: 'weekly' | 'monthly', startDate: Date, endDate: Date): Promise<ITimesheet> {
        const records = await this.getTimeTracking(staffId, startDate, endDate);
        const totalHours = records.reduce((sum, r) => sum + r.actualHours, 0);
        const totalOvertimeHours = records.reduce((sum, r) => sum + r.overtimeHours, 0);

        const timesheet: ITimesheet = {
            timesheetId: `timesheet-${Date.now()}`,
            staffId,
            period,
            startDate,
            endDate,
            totalHours,
            totalOvertimeHours,
            totalBreakTime: records.reduce((sum, r) => sum + r.breakTime, 0),
            status: 'draft',
            records,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.timesheets.has(staffId)) {
            this.timesheets.set(staffId, []);
        }
        this.timesheets.get(staffId)!.push(timesheet);

        return timesheet;
    }

    // ==================== Performance Management ====================

    async createPerformanceKPI(staffId: string, kpiData: Partial<IPerformanceKPI>): Promise<IPerformanceKPI> {
        const kpi: IPerformanceKPI = {
            kpiId: `kpi-${Date.now()}`,
            staffId,
            period: kpiData.period || 'monthly',
            startDate: kpiData.startDate || new Date(),
            endDate: kpiData.endDate || new Date(),
            utilization: kpiData.utilization || 0,
            attendanceQuality: kpiData.attendanceQuality || 0,
            parentFeedback: kpiData.parentFeedback || 0,
            skillsScore: kpiData.skillsScore || 0,
            overallScore: (kpiData.utilization || 0 + kpiData.attendanceQuality || 0 + kpiData.parentFeedback || 0 + kpiData.skillsScore || 0) / 4,
            comments: kpiData.comments,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.performanceKPIs.has(staffId)) {
            this.performanceKPIs.set(staffId, []);
        }
        this.performanceKPIs.get(staffId)!.push(kpi);

        return kpi;
    }

    async getPerformanceKPIs(staffId: string): Promise<IPerformanceKPI[]> {
        return this.performanceKPIs.get(staffId) || [];
    }

    // ==================== Payroll Management ====================

    async createPayroll(staffId: string, payrollData: Partial<IPayroll>): Promise<IPayroll> {
        const payroll: IPayroll = {
            payrollId: `payroll-${Date.now()}`,
            staffId,
            period: payrollData.period || 'monthly',
            startDate: payrollData.startDate || new Date(),
            endDate: payrollData.endDate || new Date(),
            baseSalary: payrollData.baseSalary || 0,
            overtimePay: payrollData.overtimePay || 0,
            bonuses: payrollData.bonuses || 0,
            deductions: payrollData.deductions || 0,
            netSalary: (payrollData.baseSalary || 0) + (payrollData.overtimePay || 0) + (payrollData.bonuses || 0) - (payrollData.deductions || 0),
            status: 'draft',
            paymentMethod: payrollData.paymentMethod || 'bank_transfer',
            bankDetails: payrollData.bankDetails,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.payrolls.has(staffId)) {
            this.payrolls.set(staffId, []);
        }
        this.payrolls.get(staffId)!.push(payroll);

        return payroll;
    }

    async getPayrolls(staffId: string): Promise<IPayroll[]> {
        return this.payrolls.get(staffId) || [];
    }

    async exportPayroll(period: 'weekly' | 'monthly', startDate: Date, endDate: Date, format: 'csv' | 'xero' | 'quickbooks'): Promise<IPayrollExport> {
        const allPayrolls: IPayroll[] = [];
        for (const payrolls of this.payrolls.values()) {
            allPayrolls.push(...payrolls.filter(p => p.startDate >= startDate && p.endDate <= endDate));
        }

        const totalAmount = allPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

        const export_: IPayrollExport = {
            exportId: `export-${Date.now()}`,
            period,
            startDate,
            endDate,
            totalRecords: allPayrolls.length,
            totalAmount,
            exportFormat: format,
            exportedTo: format === 'xero' ? 'Xero' : format === 'quickbooks' ? 'QuickBooks' : 'CSV',
            status: 'completed',
            exportedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return export_;
    }

    // ==================== Training & Development ====================

    async addTrainingRecord(staffId: string, trainingData: Partial<ITrainingRecord>): Promise<ITrainingRecord> {
        const training: ITrainingRecord = {
            trainingId: `training-${Date.now()}`,
            staffId,
            trainingName: trainingData.trainingName || '',
            trainingType: trainingData.trainingType || 'optional',
            status: 'not_started',
            notes: trainingData.notes,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.trainingRecords.has(staffId)) {
            this.trainingRecords.set(staffId, []);
        }
        this.trainingRecords.get(staffId)!.push(training);

        return training;
    }

    async getTrainingRecords(staffId: string): Promise<ITrainingRecord[]> {
        return this.trainingRecords.get(staffId) || [];
    }

    async createDevelopmentPlan(staffId: string, year: number, planData: Partial<IDevelopmentPlan>): Promise<IDevelopmentPlan> {
        const plan: IDevelopmentPlan = {
            planId: `plan-${Date.now()}`,
            staffId,
            year,
            goals: planData.goals || [],
            trainingsRequired: planData.trainingsRequired || [],
            trainingsRecommended: planData.trainingsRecommended || [],
            mentorAssigned: planData.mentorAssigned,
            reviewDate: planData.reviewDate || new Date(),
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.developmentPlans.set(staffId, plan);
        return plan;
    }

    // ==================== Location Assignment ====================

    async assignLocation(staffId: string, assignmentData: Partial<ILocationAssignment>): Promise<ILocationAssignment> {
        const assignment: ILocationAssignment = {
            assignmentId: `assign-${Date.now()}`,
            staffId,
            locationId: assignmentData.locationId || '',
            locationName: assignmentData.locationName || '',
            role: assignmentData.role || '',
            startDate: assignmentData.startDate || new Date(),
            isPrimary: assignmentData.isPrimary || false,
            hoursPerWeek: assignmentData.hoursPerWeek || 40,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.locationAssignments.has(staffId)) {
            this.locationAssignments.set(staffId, []);
        }
        this.locationAssignments.get(staffId)!.push(assignment);

        return assignment;
    }

    async getLocationAssignments(staffId: string): Promise<ILocationAssignment[]> {
        return this.locationAssignments.get(staffId) || [];
    }

    // ==================== Notifications ====================

    async sendNotification(staffId: string, notification: Partial<IStaffNotification>): Promise<IStaffNotification> {
        const notif: IStaffNotification = {
            notificationId: `notif-${Date.now()}`,
            staffId,
            type: notification.type || 'training_assigned',
            title: notification.title || '',
            message: notification.message || '',
            read: false,
            createdAt: new Date()
        };

        if (!this.notifications.has(staffId)) {
            this.notifications.set(staffId, []);
        }
        this.notifications.get(staffId)!.push(notif);

        return notif;
    }

    async getNotifications(staffId: string, unreadOnly: boolean = false): Promise<IStaffNotification[]> {
        const notifs = this.notifications.get(staffId) || [];
        if (unreadOnly) {
            return notifs.filter(n => !n.read);
        }
        return notifs;
    }

    // ==================== Helper Methods ====================

    private getDefaultAvailability() {
        const defaultSlot = { startTime: '09:00', endTime: '17:00', available: true };
        return {
            monday: [defaultSlot],
            tuesday: [defaultSlot],
            wednesday: [defaultSlot],
            thursday: [defaultSlot],
            friday: [defaultSlot],
            saturday: [],
            sunday: []
        };
    }
}
