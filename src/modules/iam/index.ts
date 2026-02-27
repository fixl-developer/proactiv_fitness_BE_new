// IAM Module Exports
export { User } from './user.model';
export { default as userService } from './user.service';
export { default as authService } from './auth.service';
export { default as userController } from './user.controller';
export { default as authController } from './auth.controller';
export { default as userRoutes } from './user.routes';
export { default as authRoutes } from './auth.routes';
export { authenticate, authorize, optionalAuth, checkOwnership, checkTenantAccess } from './auth.middleware';
export * from './user.interface';
