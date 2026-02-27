import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { stream } from './shared/utils/logger.util';
import { API_PREFIX } from './shared/constants';
import envConfig from './config/env.config';
import routes from './routes';

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        // Security middleware
        this.app.use(helmet());
        this.app.use(
            cors({
                origin: envConfig.get().corsOrigin,
                credentials: true,
            })
        );

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Compression middleware
        this.app.use(compression());

        // Sanitize data
        this.app.use(mongoSanitize());

        // HTTP request logger
        if (envConfig.isDevelopment()) {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined', { stream }));
        }

        // Rate limiting
        this.app.use(API_PREFIX, apiLimiter);

        // Health check endpoint
        this.app.get('/health', (_req: Request, res: Response) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            });
        });
    }

    private initializeRoutes(): void {
        // Mount centralized routes
        this.app.use(API_PREFIX, routes);
    }

    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use(notFoundHandler);

        // Global error handler
        this.app.use(errorHandler);
    }

    public getApp(): Application {
        return this.app;
    }
}

export default new App().app;
