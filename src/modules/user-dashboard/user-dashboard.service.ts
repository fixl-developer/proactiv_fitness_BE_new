import { userProfileService } from '../user-profile/user-profile.service';
import { userProgressService } from '../user-progress/user-progress.service';
import { bookingService } from '../booking/booking.service';
import { paymentService } from '../payments/payments.service';
import { walletService } from '../wallet/wallet.service';

interface DashboardRange {
    from?: string;
    to?: string;
}

function inRange(dateValue: any, range?: DashboardRange): boolean {
    if (!range?.from && !range?.to) return true;
    const d = new Date(dateValue).getTime();
    if (isNaN(d)) return true;
    if (range.from) {
        const start = new Date(range.from);
        start.setHours(0, 0, 0, 0);
        if (d < start.getTime()) return false;
    }
    if (range.to) {
        const end = new Date(range.to);
        end.setHours(23, 59, 59, 999);
        if (d > end.getTime()) return false;
    }
    return true;
}

export class UserDashboardService {
    async getDashboardData(userId: string, range?: DashboardRange): Promise<any> {
        try {
            const [profile, progress, bookings, payments, wallet] = await Promise.all([
                userProfileService.getProfile(userId),
                userProgressService.getProgress(userId),
                bookingService.getMyBookings(userId),
                paymentService.getPaymentsByUser(userId),
                walletService.getWallet(userId)
            ]);

            // Filter bookings by selected date range. We use sessionDate (preferred) → date → createdAt.
            const allBookings = Array.isArray(bookings) ? bookings : [];
            const bookingsInRange = allBookings.filter((b: any) =>
                inRange(b.sessionDate || b.date || b.createdAt, range)
            );

            const now = Date.now();
            const upcomingClasses = bookingsInRange.filter((b: any) => {
                const status = String(b.status || '').toLowerCase();
                const ts = new Date(b.sessionDate || b.date || b.createdAt).getTime();
                return (status === 'confirmed' || status === 'pending') && !isNaN(ts) && ts > now;
            }).slice(0, 10);

            const completedClasses = bookingsInRange.filter((b: any) => {
                const status = String(b.status || '').toLowerCase();
                return status === 'completed';
            }).length;

            const recentPayments = (Array.isArray(payments) ? payments : [])
                .filter((p: any) => inRange(p.createdAt || p.date, range))
                .slice(0, 5);

            // Achievements + total points come from user-progress milestones
            const achievementsCount = (progress as any)?.milestones?.length || 0;
            const totalPoints = (progress as any)?.totalPoints
                ?? (progress as any)?.points
                ?? 0;

            return {
                profile: {
                    name: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim(),
                    email: profile?.email,
                    avatar: profile?.avatar,
                    memberSince: profile?.stats?.memberSince
                },
                stats: {
                    // Frontend dashboard reads these names directly
                    upcomingClasses: upcomingClasses.length,
                    completedClasses,
                    totalBookings: bookingsInRange.length,
                    achievements: achievementsCount,
                    currentStreak: progress?.currentStreak || 0,
                    totalPoints,
                    // Legacy fields (kept for older consumers like parent dashboard)
                    totalClasses: progress?.classesAttended || 0,
                    totalSpent: profile?.stats?.totalSpent || 0,
                    accountBalance: wallet?.totalBalance || 0,
                },
                progress: {
                    overallProgress: (progress as any)?.overallProgress || 0,
                    classesAttended: progress?.classesAttended || 0,
                    classesCompleted: progress?.classesCompleted || 0,
                    currentStreak: progress?.currentStreak || 0,
                    totalHours: progress?.totalHours || 0,
                    skillsProgress: (progress as any)?.skillLevels || [],
                    performanceMetrics: progress?.performanceMetrics || {},
                },
                upcomingClasses,
                recentPayments,
                recentActivity: progress?.timeline?.slice(0, 10) || [],
                range: range && (range.from || range.to) ? { from: range.from, to: range.to } : undefined,
            };
        } catch (error) {
            throw error;
        }
    }

    async getStats(userId: string): Promise<any> {
        const [profile, progress, bookings] = await Promise.all([
            userProfileService.getProfileStats(userId),
            userProgressService.getProgress(userId),
            bookingService.getMyBookings(userId)
        ]);

        return {
            totalClasses: progress?.classesAttended || 0,
            upcomingClasses: bookings?.filter((b: any) =>
                b.status === 'confirmed' && new Date(b.date) > new Date()
            ).length || 0,
            totalSpent: profile?.totalSpent || 0,
            classesCompleted: progress?.classesCompleted || 0
        };
    }

    async getRecentActivity(userId: string): Promise<any[]> {
        const progress = await userProgressService.getProgress(userId);
        return progress?.timeline?.slice(0, 20) || [];
    }

    async getUpcoming(userId: string): Promise<any[]> {
        const bookings = await bookingService.getMyBookings(userId);
        return bookings?.filter((b: any) =>
            b.status === 'confirmed' && new Date(b.date) > new Date()
        ).slice(0, 10) || [];
    }
}

export const userDashboardService = new UserDashboardService();
