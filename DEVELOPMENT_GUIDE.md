# 🛠️ Development Guide

## Module Development Pattern

Each module follows a consistent structure for maintainability and scalability.

### Module Structure

```
src/modules/[module-name]/
├── [module-name].model.ts        # MongoDB schema/model
├── [module-name].service.ts      # Business logic
├── [module-name].controller.ts   # Request handlers
├── [module-name].routes.ts       # API routes
├── [module-name].validation.ts   # Input validation
├── [module-name].interface.ts    # TypeScript interfaces
├── [module-name].dto.ts          # Data Transfer Objects
└── __tests__/                    # Unit tests
    ├── [module-name].service.test.ts
    └── [module-name].controller.test.ts
```

### Step-by-Step Module Creation

#### 1. Define Interfaces (`[module-name].interface.ts`)

```typescript
import { Document } from 'mongoose';

export interface IYourModule extends Document {
  name: string;
  description?: string;
  status: string;
  // ... other fields
}

export interface IYourModuleCreate {
  name: string;
  description?: string;
}

export interface IYourModuleUpdate {
  name?: string;
  description?: string;
  status?: string;
}
```

#### 2. Create Model (`[module-name].model.ts`)

```typescript
import { Schema, model } from 'mongoose';
import { IYourModule } from './your-module.interface';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const yourModuleSchema = new Schema<IYourModule>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    ...baseSchemaFields,
  },
  baseSchemaOptions
);

// Indexes
yourModuleSchema.index({ name: 1 });
yourModuleSchema.index({ status: 1 });

export const YourModule = model<IYourModule>('YourModule', yourModuleSchema);
```

#### 3. Create Service (`[module-name].service.ts`)

```typescript
import { BaseService } from '@shared/base/base.service';
import { YourModule } from './your-module.model';
import { IYourModule, IYourModuleCreate, IYourModuleUpdate } from './your-module.interface';

export class YourModuleService extends BaseService<IYourModule> {
  constructor() {
    super(YourModule);
  }

  async createYourModule(data: IYourModuleCreate): Promise<IYourModule> {
    return await this.create(data as Partial<IYourModule>);
  }

  async updateYourModule(id: string, data: IYourModuleUpdate): Promise<IYourModule | null> {
    return await this.update(id, data);
  }

  async getYourModuleById(id: string): Promise<IYourModule | null> {
    return await this.findById(id);
  }

  async getAllYourModules(): Promise<IYourModule[]> {
    return await this.findAll();
  }

  async deleteYourModule(id: string): Promise<boolean> {
    return await this.delete(id);
  }

  // Add custom business logic methods here
  async findByStatus(status: string): Promise<IYourModule[]> {
    return await this.findAll({ status });
  }
}

export default new YourModuleService();
```

#### 4. Create Validation (`[module-name].validation.ts`)

```typescript
import { body, param } from 'express-validator';

export const createYourModuleValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

export const updateYourModuleValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Invalid status'),
];

export const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];
```

#### 5. Create Controller (`[module-name].controller.ts`)

```typescript
import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import yourModuleService from './your-module.service';

export class YourModuleController extends BaseController {
  async create(req: Request, res: Response) {
    const data = req.body;
    const result = await yourModuleService.createYourModule(data);
    return this.sendCreated(res, result, 'Your module created successfully');
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await yourModuleService.getYourModuleById(id);
    
    if (!result) {
      return this.sendNotFound(res, 'Your module not found');
    }
    
    return this.sendSuccess(res, result);
  }

  async getAll(req: Request, res: Response) {
    const result = await yourModuleService.getAllYourModules();
    return this.sendSuccess(res, result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;
    const result = await yourModuleService.updateYourModule(id, data);
    
    if (!result) {
      return this.sendNotFound(res, 'Your module not found');
    }
    
    return this.sendSuccess(res, result, 'Your module updated successfully');
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await yourModuleService.deleteYourModule(id);
    
    if (!result) {
      return this.sendNotFound(res, 'Your module not found');
    }
    
    return this.sendSuccess(res, null, 'Your module deleted successfully');
  }
}

export default new YourModuleController();
```

#### 6. Create Routes (`[module-name].routes.ts`)

```typescript
import { Router } from 'express';
import yourModuleController from './your-module.controller';
import { validate } from '@middleware/validation.middleware';
import {
  createYourModuleValidation,
  updateYourModuleValidation,
  idParamValidation,
} from './your-module.validation';

const router = Router();

// Create
router.post(
  '/',
  validate(createYourModuleValidation),
  yourModuleController.wrap(yourModuleController.create)
);

// Get all
router.get('/', yourModuleController.wrap(yourModuleController.getAll));

// Get by ID
router.get(
  '/:id',
  validate(idParamValidation),
  yourModuleController.wrap(yourModuleController.getById)
);

// Update
router.put(
  '/:id',
  validate(updateYourModuleValidation),
  yourModuleController.wrap(yourModuleController.update)
);

// Delete
router.delete(
  '/:id',
  validate(idParamValidation),
  yourModuleController.wrap(yourModuleController.delete)
);

export default router;
```

#### 7. Register Routes in `app.ts`

```typescript
import yourModuleRoutes from '@modules/your-module/your-module.routes';

// In initializeRoutes method:
this.app.use(`${API_PREFIX}/your-modules`, yourModuleRoutes);
```

### Testing Pattern

#### Unit Test Example (`__tests__/[module-name].service.test.ts`)

```typescript
import yourModuleService from '../your-module.service';
import { YourModule } from '../your-module.model';

describe('YourModuleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createYourModule', () => {
    it('should create a new module', async () => {
      const mockData = {
        name: 'Test Module',
        description: 'Test Description',
      };

      const result = await yourModuleService.createYourModule(mockData);

      expect(result).toBeDefined();
      expect(result.name).toBe(mockData.name);
    });
  });

  describe('getYourModuleById', () => {
    it('should return module by id', async () => {
      // Test implementation
    });

    it('should return null for non-existent id', async () => {
      // Test implementation
    });
  });
});
```

## Best Practices

### 1. Error Handling

Always use try-catch in controllers and let the global error handler manage errors:

```typescript
async create(req: Request, res: Response) {
  try {
    const result = await yourModuleService.createYourModule(req.body);
    return this.sendCreated(res, result);
  } catch (error) {
    throw new AppError('Failed to create module', HTTP_STATUS.BAD_REQUEST);
  }
}
```

### 2. Validation

- Use express-validator for input validation
- Validate all user inputs
- Sanitize strings to prevent XSS

### 3. Database Queries

- Use indexes for frequently queried fields
- Implement pagination for list endpoints
- Use lean() for read-only queries
- Avoid N+1 queries with populate

### 4. Security

- Never expose sensitive data in responses
- Use HTTPS in production
- Implement rate limiting
- Validate and sanitize all inputs
- Use parameterized queries

### 5. Code Organization

- Keep controllers thin (only handle HTTP)
- Put business logic in services
- Use interfaces for type safety
- Follow DRY principle
- Write self-documenting code

### 6. Documentation

- Add JSDoc comments for complex functions
- Document API endpoints
- Keep README updated
- Document environment variables

## Common Patterns

### Pagination

```typescript
async getAll(req: Request, res: Response) {
  const paginationQuery = {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  };
  
  const result = await yourModuleService.findWithPagination({}, paginationQuery);
  return this.sendSuccess(res, result);
}
```

### Search & Filter

```typescript
async search(req: Request, res: Response) {
  const { query, status } = req.query;
  
  const filter: any = {};
  
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }
  
  if (status) {
    filter.status = status;
  }
  
  const result = await yourModuleService.findAll(filter);
  return this.sendSuccess(res, result);
}
```

### Soft Delete

```typescript
async delete(req: Request, res: Response) {
  const { id } = req.params;
  // Soft delete (default)
  const result = await yourModuleService.delete(id);
  return this.sendSuccess(res, null, 'Deleted successfully');
}

async hardDelete(req: Request, res: Response) {
  const { id } = req.params;
  // Hard delete
  const result = await yourModuleService.delete(id, true);
  return this.sendSuccess(res, null, 'Permanently deleted');
}
```

## Debugging Tips

1. **Use logger instead of console.log:**
   ```typescript
   import logger from '@shared/utils/logger.util';
   logger.info('User created', { userId: user.id });
   logger.error('Failed to create user', error);
   ```

2. **Check MongoDB queries:**
   ```typescript
   mongoose.set('debug', true); // In development
   ```

3. **Use VS Code debugger:**
   - Set breakpoints
   - Use launch.json configuration
   - Inspect variables

4. **Test with Postman/Insomnia:**
   - Create collections for each module
   - Save example requests
   - Use environment variables

## Next Steps

1. Start with Phase 1 - IAM Module
2. Follow this guide for each new module
3. Write tests as you go
4. Keep documentation updated

Happy coding! 🚀
