import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, checkOwnership } from '../auth.middleware';
import userService from '../user.service';
import { UserRole, UserStatus } from '@shared/enums';

jest.mock('jsonwebtoken');
jest.mock('../user.service');

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        it('should authenticate valid token', async () => {
            const mockUser: any = {
                _id: 'user123',
                email: 'test@example.com',
                role: UserRole.PARENT,
                status: UserStatus.ACTIVE,
            };

            mockRequest.headers = {
                authorization: 'Bearer valid_token',
            };

            (jwt.verify as jest.Mock).mockReturnValue({
                id: 'user123',
                email: 'test@example.com',
                role: UserRole.PARENT,
            });

            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(jwt.verify).toHaveBeenCalled();
            expect(userService.getUserById).toHaveBeenCalledWith('user123');
            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user?.id).toBe('user123');
            expect(nextFunction).toHaveBeenCalled();
        });

        it('should reject request without token', async () => {
            mockRequest.headers = {};

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should reject invalid token', async () => {
            mockRequest.headers = {
                authorization: 'Bearer invalid_token',
            };

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('JsonWebTokenError');
            });

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should reject if user not found', async () => {
            mockRequest.headers = {
                authorization: 'Bearer valid_token',
            };

            (jwt.verify as jest.Mock).mockReturnValue({
                id: 'user123',
            });

            (userService.getUserById as jest.Mock).mockResolvedValue(null);

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should reject if user is not active', async () => {
            const mockUser: any = {
                _id: 'user123',
                status: UserStatus.SUSPENDED,
            };

            mockRequest.headers = {
                authorization: 'Bearer valid_token',
            };

            (jwt.verify as jest.Mock).mockReturnValue({
                id: 'user123',
            });

            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('authorize', () => {
        it('should allow access for authorized role', () => {
            mockRequest.user = {
                id: 'user123',
                email: 'admin@example.com',
                role: UserRole.SUPER_ADMIN,
            };

            const middleware = authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN);
            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should deny access for unauthorized role', () => {
            mockRequest.user = {
                id: 'user123',
                email: 'parent@example.com',
                role: UserRole.PARENT,
            };

            const middleware = authorize(UserRole.SUPER_ADMIN, UserRole.HQ_ADMIN);
            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should deny access if user not authenticated', () => {
            mockRequest.user = undefined;

            const middleware = authorize(UserRole.SUPER_ADMIN);
            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('checkOwnership', () => {
        it('should allow access for resource owner', () => {
            mockRequest.user = {
                id: 'user123',
                email: 'user@example.com',
                role: UserRole.PARENT,
            };
            mockRequest.params = {
                id: 'user123',
            };

            const middleware = checkOwnership('id');
            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should allow access for super admin', () => {
            mockRequest.user = {
                id: 'admin123',
                email: 'admin@example.com',
                role: UserRole.SUPER_ADMIN,
            };
            mockRequest.params = {
                id: 'user123',
            };

            const middleware = checkOwnership('id');
            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should deny access for non-owner', () => {
            mockRequest.user = {
                id: 'user123',
                email: 'user@example.com',
                role: UserRole.PARENT,
            };
            mockRequest.params = {
                id: 'otheruser456',
            };

            const middleware = checkOwnership('id');
            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
