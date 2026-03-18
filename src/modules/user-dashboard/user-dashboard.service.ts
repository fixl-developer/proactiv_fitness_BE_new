import { userProfileService } from '../user-profile/user-profile.service';
import { userProgressService } from '../user-progress/user-progress.service';
import { bookingService } from '../booking/booking.service';
import { paymentService } from '../payments/payments.service';
import { walletService } from '../wallet/wallet.service';

export class UserDashboardService {
    async getDashboardData(userId: string): Promise<any> {
        try {
            const [profile, progress, bookings, payments, wallet] = await Promise.all([
                userProfileService.getProfile(userId),
                userProgressService.getProgress(userId),
                bookingService.getBookingsByUser(userId),
                paymentService.getPaymentsByUser(userId),
                walletService.getWallet(userId)
            ]);

            const upcomingClasses = bookings?.filter((b: any) =>
                b.status === 'confirmed' && new Date(b.date) > new Date()
            ).slice(0, 5) || [];

            const recentPayments = payments?.slice(0, 5) || [];

            return {
                profile: {
                    name: `${profile?.firstName} ${profile?.lastName}`,
                    email: profile?.email,
                    avatar: profile?.avatar,
                    memberSince: profile?.stats?.memberSince
                },
                stats: {
                    totalClasses: progress?.classesAttended || 0,
                    upcomingClasses: upcomingClasses.length,
                    totalSpent: profile?.stats?.totalSpent || 0,
                    accountBalance: wallet?.balance || 0
                },
                progress: {
                    classesAttended: progress?.classesAttended || 0,
                    classesCompleted: progress?.classesCompleted || 0,
                    currentStreak: progress?.currentStreak || 0,
                    totalHours: progress?.totalHours || 0
                },
                upcomingClasses,
                recentPayments,
                recentActivity: progress?.timeline?.slice(0, 10) || []
            };
        } catch (error) {
            throw error;
        }
    }

    async getStats(userId: string): Promise<any> {
        const [profile, progress, bookings] = await Promise.all([
            userProfileService.getProfileStats(userId),
            userProgressService.getProgress(userId),
            bookingService.getBookingsByUser(userId)
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
        const bookings = await bookingService.getBookingsByUser(userId);
        return bookings?.filter((b: any) =>
            b.status === 'confirmed' && new Date(b.date) > new Date()
        ).slice(0, 10) || [];
    }
}

export const userDashboardService = new UserDashboardService();
