import { Router } from 'express';
import { RuleController, PolicyController, RuleTemplateController } from './rule.controller';
import { authenticate } from '../iam/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const ruleController = new RuleController();
const policyController = new PolicyController();
const ruleTemplateController = new RuleTemplateController();

// Validation rules
// Note: ruleType, actions, effectiveFrom are optional here — controller will
// derive sensible defaults from `category` / fall back to ALLOW / now() so the
// admin Rules UI (which only collects name/category/conditions/priority) works.
const createRuleValidation = [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Rule name is required (1-100 characters)'),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    body('ruleType').optional().isString(),
    body('category').isString().withMessage('Category is required'),
    body('conditions').isArray({ min: 1 }).withMessage('At least one condition is required'),
    body('actions').optional().isArray(),
    body('priority').optional().isInt({ min: 1, max: 1000 }),
    body('effectiveFrom').optional().isISO8601(),
    validate
];

const updateRuleValidation = [
    param('id').isMongoId().withMessage('Valid rule ID is required'),
    body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().isString().trim().isLength({ min: 1, max: 500 }),
    body('priority').optional().isInt({ min: 1, max: 1000 }),
    validate
];

const createPolicyValidation = [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Policy name is required (1-100 characters)'),
    body('description').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Description is required (1-500 characters)'),
    body('policyType').isString().withMessage('Policy type is required'),
    body('ruleIds').isArray({ min: 1 }).withMessage('At least one rule ID is required'),
    body('defaultAction').isString().withMessage('Default action is required'),
    body('effectiveFrom').isISO8601().withMessage('Valid effective from date is required'),
    validate
];

// Note: Admin "Test All Rules" button posts an empty body. Controller fills
// in defaults (ruleType from query/body or undefined → "all", timestamp = now).
const evaluateRulesValidation = [
    body('ruleType').optional().isString(),
    body('context').optional().isObject(),
    body('context.timestamp').optional().isISO8601(),
    validate
];

const evaluatePolicyValidation = [
    param('id').isMongoId().withMessage('Valid policy ID is required'),
    body('userId').optional().isMongoId(),
    body('programId').optional().isMongoId(),
    body('sessionId').optional().isMongoId(),
    body('timestamp').isISO8601().withMessage('Valid timestamp is required'),
    validate
];

// Rule Routes

/**
 * @route   GET /api/v1/rules
 * @desc    Get all rules with filtering
 * @access  Private
 */
router.get('/',
    authenticate,
    ruleController.getRules
);

/**
 * @route   GET /api/v1/rules/:id
 * @desc    Get rule by ID
 * @access  Private
 */
router.get('/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid rule ID is required'),
    validate,
    ruleController.getRuleById
);

/**
 * @route   POST /api/v1/rules
 * @desc    Create new rule
 * @access  Private (Admin, Manager)
 */
router.post('/',
    authenticate,
    createRuleValidation,
    ruleController.createRule
);

/**
 * @route   PUT /api/v1/rules/:id
 * @desc    Update rule
 * @access  Private (Admin, Manager)
 */
router.put('/:id',
    authenticate,
    updateRuleValidation,
    ruleController.updateRule
);

/**
 * @route   DELETE /api/v1/rules/:id
 * @desc    Delete rule
 * @access  Private (Admin, Manager)
 */
router.delete('/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid rule ID is required'),
    validate,
    ruleController.deleteRule
);

/**
 * @route   PATCH /api/v1/rules/:id/status
 * @desc    Toggle rule status
 * @access  Private (Admin, Manager)
 */
router.patch('/:id/status',
    authenticate,
    param('id').isMongoId().withMessage('Valid rule ID is required'),
    body('status').isIn(['active', 'inactive', 'draft', 'expired']).withMessage('Valid status is required'),
    validate,
    ruleController.toggleRuleStatus
);

/**
 * @route   POST /api/v1/rules/evaluate
 * @desc    Evaluate rules for given context
 * @access  Private
 */
router.post('/evaluate',
    authenticate,
    evaluateRulesValidation,
    ruleController.evaluateRules
);

/**
 * @route   GET /api/v1/rules/:id/statistics
 * @desc    Get rule statistics
 * @access  Private (Admin, Manager)
 */
router.get('/:id/statistics',
    authenticate,
    param('id').isMongoId().withMessage('Valid rule ID is required'),
    validate,
    ruleController.getRuleStatistics
);

// Policy Routes

/**
 * @route   GET /api/v1/policies
 * @desc    Get all policies with filtering
 * @access  Private
 */
router.get('/policies',
    authenticate,
    policyController.getPolicies
);

/**
 * @route   GET /api/v1/policies/:id
 * @desc    Get policy by ID
 * @access  Private
 */
router.get('/policies/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid policy ID is required'),
    validate,
    policyController.getPolicyById
);

/**
 * @route   POST /api/v1/policies
 * @desc    Create new policy
 * @access  Private (Admin, Manager)
 */
router.post('/policies',
    authenticate,
    createPolicyValidation,
    policyController.createPolicy
);

/**
 * @route   PUT /api/v1/policies/:id
 * @desc    Update policy
 * @access  Private (Admin, Manager)
 */
router.put('/policies/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid policy ID is required'),
    validate,
    policyController.updatePolicy
);

/**
 * @route   DELETE /api/v1/policies/:id
 * @desc    Delete policy
 * @access  Private (Admin, Manager)
 */
router.delete('/policies/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid policy ID is required'),
    validate,
    policyController.deletePolicy
);

/**
 * @route   POST /api/v1/policies/:id/evaluate
 * @desc    Evaluate policy for given context
 * @access  Private
 */
router.post('/policies/:id/evaluate',
    authenticate,
    evaluatePolicyValidation,
    policyController.evaluatePolicy
);

/**
 * @route   GET /api/v1/policies/:id/statistics
 * @desc    Get policy statistics
 * @access  Private (Admin, Manager)
 */
router.get('/policies/:id/statistics',
    authenticate,
    param('id').isMongoId().withMessage('Valid policy ID is required'),
    validate,
    policyController.getPolicyStatistics
);

// Rule Template Routes

/**
 * @route   GET /api/v1/rule-templates
 * @desc    Get all rule templates
 * @access  Private
 */
router.get('/templates',
    authenticate,
    ruleTemplateController.getRuleTemplates
);

/**
 * @route   GET /api/v1/rule-templates/:id
 * @desc    Get rule template by ID
 * @access  Private
 */
router.get('/templates/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid template ID is required'),
    validate,
    ruleTemplateController.getRuleTemplateById
);

/**
 * @route   POST /api/v1/rule-templates
 * @desc    Create new rule template
 * @access  Private (Admin, Manager)
 */
router.post('/templates',
    authenticate,
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Template name is required'),
    body('ruleType').isString().withMessage('Rule type is required'),
    validate,
    ruleTemplateController.createRuleTemplate
);

/**
 * @route   POST /api/v1/rule-templates/:templateId/create-rule
 * @desc    Create rule from template
 * @access  Private (Admin, Manager)
 */
router.post('/templates/:templateId/create-rule',
    authenticate,
    param('templateId').isMongoId().withMessage('Valid template ID is required'),
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Rule name is required'),
    validate,
    ruleController.createRuleFromTemplate
);

export default router;
