import { User } from '../user.model';
import userService from '../user.service';
import { UserRole, UserStatus } from '@shared/enums';

// Mock the User model
jest.mock('../user.model');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockUserData = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                role: UserRole.PARENT,
            };

            const mockUser = {
                _id: 'user123',
                ...mockUserData,
                fullName: 'John Doe',
                status: UserStatus.ACTIVE,
                isEmailVerified: false,
                save: jest.fn().mockResolvedValue(true),
            };

            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.prototype.save as jest.Mock) = jest.fn().mockResolvedValue(mockUser);

            const result = await userService.createUser(mockUserData);

            expect(User.findOne).toHaveBeenCalledWith({ email: mockUserData.email.toLowerCase() });
            expect(result).toBeDefined();
        });

        it('should throw error if user already exists', async () => {
            const mockUserData = {
                email: 'existing@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                role: UserRole.PARENT,
            };

            (User.findOne as jest.Mock).mockResolvedValue({ email: mockUserData.email });

            await expect(userService.createUser(mockUserData)).rejects.toThrow(
                'User with this email already exists'
            );
        });
    });

    describe('getUserByEmail', () => {
        it('should return user by email', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUserByEmail('test@example.com');

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
                isDeleted: false,
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            const result = await userService.getUserByEmail('notfound@example.com');

            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const userId = 'user123';
            const updateData = {
                firstName: 'Jane',
                lastName: 'Smith',
            };

            const mockUpdatedUser = {
                _id: userId,
                ...updateData,
                email: 'test@example.com',
            };

            (User.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUser(userId, updateData);

            expect(result).toEqual(mockUpdatedUser);
        });

        it('should throw error if user not found', async () => {
            (User.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(userService.updateUser('invalid', {})).rejects.toThrow('User not found');
        });
    });

    describe('deleteUser', () => {
        it('should soft delete user', async () => {
            const userId = 'user123';

            (User.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

            const result = await userService.deleteUser(userId);

            expect(result).toBe(true);
            expect(User.updateOne).toHaveBeenCalledWith(
                { _id: userId },
                expect.objectContaining({ isDeleted: true })
            );
        });
    });

    describe('updateUserStatus', () => {
        it('should update user status', async () => {
            const userId = 'user123';
            const newStatus = UserStatus.SUSPENDED;

            const mockUser = {
                _id: userId,
                status: newStatus,
            };

            (User.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.updateUserStatus(userId, newStatus);

            expect(result?.status).toBe(newStatus);
        });
    });

    describe('formatUserResponse', () => {
        it('should format user response correctly', () => {
            const mockUser: any = {
                _id: 'user123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                phone: '+1234567890',
                role: UserRole.PARENT,
                status: UserStatus.ACTIVE,
                isEmailVerified: true,
                isPhoneVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = userService.formatUserResponse(mockUser);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('firstName');
            expect(result).toHaveProperty('lastName');
            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('refreshToken');
        });
    });
});
