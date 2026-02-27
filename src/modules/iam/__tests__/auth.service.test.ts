import authService from '../auth.service';
import userService from '../user.service';
import { UserRole, UserStatus } from '@shared/enums';

jest.mock('../user.service');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerData = {
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
            };

            const mockUser: any = {
                _id: 'user123',
                email: registerData.email,
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                role: UserRole.PARENT,
                status: UserStatus.ACTIVE,
                generateAuthToken: jest.fn().mockReturnValue('access_token'),
                generateRefreshToken: jest.fn().mockReturnValue('refresh_token'),
            };

            (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
            (userService.saveRefreshToken as jest.Mock).mockResolvedValue(undefined);
            (userService.generateEmailVerificationToken as jest.Mock).mockResolvedValue('verify_token');
            (userService.formatUserResponse as jest.Mock).mockReturnValue({
                id: mockUser._id,
                email: mockUser.email,
            });

            const result = await authService.register(registerData);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
            expect(userService.createUser).toHaveBeenCalled();
        });

        it('should throw error if passwords do not match', async () => {
            const registerData = {
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'DifferentPassword123!',
                firstName: 'John',
                lastName: 'Doe',
            };

            await expect(authService.register(registerData)).rejects.toThrow('Passwords do not match');
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const loginData = {
                email: 'user@example.com',
                password: 'Password123!',
            };

            const mockUser: any = {
                _id: 'user123',
                email: loginData.email,
                status: UserStatus.ACTIVE,
                comparePassword: jest.fn().mockResolvedValue(true),
                isLocked: jest.fn().mockReturnValue(false),
                generateAuthToken: jest.fn().mockReturnValue('access_token'),
                generateRefreshToken: jest.fn().mockReturnValue('refresh_token'),
            };

            (userService.getUserByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);
            (userService.resetFailedLoginAttempts as jest.Mock).mockResolvedValue(undefined);
            (userService.updateLastLogin as jest.Mock).mockResolvedValue(undefined);
            (userService.saveRefreshToken as jest.Mock).mockResolvedValue(undefined);
            (userService.formatUserResponse as jest.Mock).mockReturnValue({
                id: mockUser._id,
                email: mockUser.email,
            });

            const result = await authService.login(loginData);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
        });

        it('should throw error if user not found', async () => {
            const loginData = {
                email: 'notfound@example.com',
                password: 'Password123!',
            };

            (userService.getUserByEmailWithPassword as jest.Mock).mockResolvedValue(null);

            await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
        });

        it('should throw error if account is locked', async () => {
            const loginData = {
                email: 'locked@example.com',
                password: 'Password123!',
            };

            const mockUser: any = {
                _id: 'user123',
                email: loginData.email,
                isLocked: jest.fn().mockReturnValue(true),
            };

            (userService.getUserByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);

            await expect(authService.login(loginData)).rejects.toThrow(
                'Account is temporarily locked'
            );
        });

        it('should throw error if password is invalid', async () => {
            const loginData = {
                email: 'user@example.com',
                password: 'WrongPassword123!',
            };

            const mockUser: any = {
                _id: 'user123',
                email: loginData.email,
                status: UserStatus.ACTIVE,
                comparePassword: jest.fn().mockResolvedValue(false),
                isLocked: jest.fn().mockReturnValue(false),
            };

            (userService.getUserByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);
            (userService.incrementFailedLoginAttempts as jest.Mock).mockResolvedValue(undefined);

            await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
            expect(userService.incrementFailedLoginAttempts).toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const userId = 'user123';

            (userService.clearRefreshToken as jest.Mock).mockResolvedValue(undefined);

            await authService.logout(userId);

            expect(userService.clearRefreshToken).toHaveBeenCalledWith(userId);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const userId = 'user123';
            const currentPassword = 'OldPassword123!';
            const newPassword = 'NewPassword123!';
            const confirmPassword = 'NewPassword123!';

            (userService.changePassword as jest.Mock).mockResolvedValue(undefined);

            await authService.changePassword(userId, currentPassword, newPassword, confirmPassword);

            expect(userService.changePassword).toHaveBeenCalledWith(
                userId,
                currentPassword,
                newPassword
            );
        });

        it('should throw error if passwords do not match', async () => {
            const userId = 'user123';
            const currentPassword = 'OldPassword123!';
            const newPassword = 'NewPassword123!';
            const confirmPassword = 'DifferentPassword123!';

            await expect(
                authService.changePassword(userId, currentPassword, newPassword, confirmPassword)
            ).rejects.toThrow('Passwords do not match');
        });
    });
});
