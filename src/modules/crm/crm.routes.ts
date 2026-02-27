import { Router } from 'express';
import { FamilyController, ChildController, InquiryController, LeadController } from './crm.controller';
import { authMiddleware } from '../iam/auth.middleware';
import { validateRequest } from '../../shared/utils/validation.util';
import { body, param, query } from 'express-validator';

const router = Router();
const familyController = new FamilyController();
const childController = new ChildController();
const inquiryController = new InquiryController();
const leadController = new LeadController();

// Validation rules
const createFamilyValidation = [
    body('familyName').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Family name is required (1-100 characters)'),
    body('primaryEmail').isEmail().withMessage('Valid primary email is required'),
    body('primaryPhone').isString().trim().isLength({ min: 10 }).withMessage('Valid primary phone is required'),
    body('businessUnitId').isMongoId().withMessage('Valid business unit ID is required'),
    body('locationIds').isArray({ min: 1 }).withMessage('At least one location ID is required'),
    body('primaryParent.firstName').isString().trim().isLength({ min: 1 }).withMessage('Primary parent first name is required'),
    body('primaryParent.lastName').isString().trim().isLength({ min: 1 }).withMessage('Primary parent last name is required'),
    body('primaryParent.email').isEmail().withMessage('Valid primary parent email is required'),
    body('primaryParent.phone').isString().trim().isLength({ min: 10 }).withMessage('Valid primary parent phone is required'),
    validateRequest
];

const createChildValidation = [
    body('firstName').isString().trim().isLength({ min: 1, max: 50 }).withMessage('First name is required (1-50 characters)'),
    body('lastName').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required (1-50 characters)'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Valid gender is required'),
    body('familyId').isMongoId().withMessage('Valid family ID is required'),
    body('parentIds').isArray({ min: 1 }).withMessage('At least one parent ID is required'),
    body('emergencyContacts').isArray({ min: 1 }).withMessage('At least one emergency contact is required'),
    body('mediaConsent.photography').isBoolean().withMessage('Photography consent is required'),
    body('mediaConsent.videography').isBoolean().withMessage('Videography consent is required'),
    body('mediaConsent.socialMedia').isBoolean().withMessage('Social media consent is required'),
    body('mediaConsent.marketing').isBoolean().withMessage('Marketing consent is required'),
    validateRequest
];

const createInquiryValidation = [
    body('parentName').isString().trim().isLength({ min: 1 }).withMessage('Parent name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').isString().trim().isLength({ min: 10 }).withMessage('Valid phone is required'),
    body('childAgeType').isIn(['months', 'years']).withMessage('Valid age type is required'),
    body('interestedPrograms').isArray({ min: 1 }).withMessage('At least one interested program is required'),
    body('preferredLocations').isArray({ min: 1 }).withMessage('At least one preferred location is required'),
    body('source').isString().withMessage('Lead source is required'),
    body('businessUnitId').isMongoId().withMessage('Valid business unit ID is required'),
    validateRequest
];

// Family Routes

/**
 * @route   GET /api/v1/families
 * @desc    Get all families with filtering
 * @access  Private
 */
router.get('/families',
    authMiddleware,
    familyController.getFamilies
);

/**
 * @route   GET /api/v1/families/statistics
 * @desc    Get family statistics
 * @access  Private (Admin, Manager)
 */
router.get('/families/statistics',
    authMiddleware,
    familyController.getFamilyStatistics
);

/**
 * @route   GET /api/v1/families/:id
 * @desc    Get family by ID
 * @access  Private
 */
router.get('/families/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid family ID is required'),
    validateRequest,
    familyController.getFamilyById
);

/**
 * @route   POST /api/v1/families
 * @desc    Create new family
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/families',
    authMiddleware,
    createFamilyValidation,
    familyController.createFamily
);

/**
 * @route   PUT /api/v1/families/:id
 * @desc    Update family
 * @access  Private (Admin, Manager, Staff)
 */
router.put('/families/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid family ID is required'),
    validateRequest,
    familyController.updateFamily
);

/**
 * @route   DELETE /api/v1/families/:id
 * @desc    Delete family
 * @access  Private (Admin, Manager)
 */
router.delete('/families/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid family ID is required'),
    validateRequest,
    familyController.deleteFamily
);

/**
 * @route   POST /api/v1/families/:id/members
 * @desc    Add family member
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/families/:id/members',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid family ID is required'),
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('relationship').isString().withMessage('Relationship is required'),
    validateRequest,
    familyController.addFamilyMember
);

/**
 * @route   PATCH /api/v1/families/:id/status
 * @desc    Update family status
 * @access  Private (Admin, Manager)
 */
router.patch('/families/:id/status',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid family ID is required'),
    body('status').isIn(['active', 'inactive', 'suspended', 'archived']).withMessage('Valid status is required'),
    validateRequest,
    familyController.updateFamilyStatus
);

/**
 * @route   POST /api/v1/families/:id/communications
 * @desc    Add communication log
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/families/:id/communications',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid family ID is required'),
    body('channel').isString().withMessage('Communication channel is required'),
    body('content').isString().withMessage('Communication content is required'),
    validateRequest,
    familyController.addCommunicationLog
);

// Child Routes

/**
 * @route   GET /api/v1/children
 * @desc    Get all children with filtering
 * @access  Private
 */
router.get('/children',
    authMiddleware,
    childController.getChildren
);

/**
 * @route   GET /api/v1/children/:id
 * @desc    Get child by ID
 * @access  Private
 */
router.get('/children/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid child ID is required'),
    validateRequest,
    childController.getChildById
);

/**
 * @route   POST /api/v1/children
 * @desc    Create new child
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/children',
    authMiddleware,
    createChildValidation,
    childController.createChild
);

/**
 * @route   PUT /api/v1/children/:id
 * @desc    Update child
 * @access  Private (Admin, Manager, Staff)
 */
router.put('/children/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid child ID is required'),
    validateRequest,
    childController.updateChild
);

/**
 * @route   DELETE /api/v1/children/:id
 * @desc    Delete child
 * @access  Private (Admin, Manager)
 */
router.delete('/children/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid child ID is required'),
    validateRequest,
    childController.deleteChild
);

/**
 * @route   POST /api/v1/children/:id/medical-flags
 * @desc    Add medical flag
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/children/:id/medical-flags',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid child ID is required'),
    body('type').isString().withMessage('Medical flag type is required'),
    body('description').isString().withMessage('Description is required'),
    body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid severity is required'),
    validateRequest,
    childController.addMedicalFlag
);

/**
 * @route   POST /api/v1/children/:id/behavioral-notes
 * @desc    Add behavioral note
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/children/:id/behavioral-notes',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid child ID is required'),
    body('note').isString().withMessage('Note is required'),
    body('category').isIn(['positive', 'concern', 'neutral']).withMessage('Valid category is required'),
    validateRequest,
    childController.addBehavioralNote
);

/**
 * @route   PATCH /api/v1/children/:id/skill-level
 * @desc    Update skill level
 * @access  Private (Admin, Manager, Staff)
 */
router.patch('/children/:id/skill-level',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid child ID is required'),
    body('skill').isString().withMessage('Skill is required'),
    body('level').isString().withMessage('Level is required'),
    validateRequest,
    childController.updateSkillLevel
);

/**
 * @route   POST /api/v1/children/:id/achievements
 * @desc    Add achievement
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/children/:id/achievements',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid child ID is required'),
    body('type').isString().withMessage('Achievement type is required'),
    body('title').isString().withMessage('Achievement title is required'),
    body('description').isString().withMessage('Achievement description is required'),
    body('dateAchieved').isISO8601().withMessage('Valid achievement date is required'),
    validateRequest,
    childController.addAchievement
);

// Inquiry Routes

/**
 * @route   GET /api/v1/inquiries
 * @desc    Get all inquiries with filtering
 * @access  Private
 */
router.get('/inquiries',
    authMiddleware,
    inquiryController.getInquiries
);

/**
 * @route   GET /api/v1/inquiries/statistics
 * @desc    Get inquiry statistics
 * @access  Private (Admin, Manager)
 */
router.get('/inquiries/statistics',
    authMiddleware,
    inquiryController.getInquiryStatistics
);

/**
 * @route   GET /api/v1/inquiries/:id
 * @desc    Get inquiry by ID
 * @access  Private
 */
router.get('/inquiries/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid inquiry ID is required'),
    validateRequest,
    inquiryController.getInquiryById
);

/**
 * @route   POST /api/v1/inquiries
 * @desc    Create new inquiry
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/inquiries',
    authMiddleware,
    createInquiryValidation,
    inquiryController.createInquiry
);

/**
 * @route   PUT /api/v1/inquiries/:id
 * @desc    Update inquiry
 * @access  Private (Admin, Manager, Staff)
 */
router.put('/inquiries/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid inquiry ID is required'),
    validateRequest,
    inquiryController.updateInquiry
);

/**
 * @route   DELETE /api/v1/inquiries/:id
 * @desc    Delete inquiry
 * @access  Private (Admin, Manager)
 */
router.delete('/inquiries/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid inquiry ID is required'),
    validateRequest,
    inquiryController.deleteInquiry
);

/**
 * @route   PATCH /api/v1/inquiries/:id/status
 * @desc    Update inquiry status
 * @access  Private (Admin, Manager, Staff)
 */
router.patch('/inquiries/:id/status',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid inquiry ID is required'),
    body('status').isIn(['new', 'contacted', 'scheduled', 'visited', 'enrolled', 'declined', 'lost']).withMessage('Valid status is required'),
    validateRequest,
    inquiryController.updateInquiryStatus
);

/**
 * @route   PATCH /api/v1/inquiries/:id/assign
 * @desc    Assign inquiry to staff
 * @access  Private (Admin, Manager)
 */
router.patch('/inquiries/:id/assign',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid inquiry ID is required'),
    body('assignedTo').isMongoId().withMessage('Valid staff ID is required'),
    validateRequest,
    inquiryController.assignInquiry
);

/**
 * @route   POST /api/v1/inquiries/:id/convert
 * @desc    Convert inquiry to family
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/inquiries/:id/convert',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid inquiry ID is required'),
    body('familyId').isMongoId().withMessage('Valid family ID is required'),
    validateRequest,
    inquiryController.convertInquiry
);

/**
 * @route   POST /api/v1/inquiries/:id/follow-up
 * @desc    Add follow-up note
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/inquiries/:id/follow-up',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid inquiry ID is required'),
    body('note').isString().withMessage('Follow-up note is required'),
    body('nextFollowUp').isISO8601().withMessage('Valid next follow-up date is required'),
    validateRequest,
    inquiryController.addFollowUpNote
);

// Lead Routes

/**
 * @route   GET /api/v1/leads
 * @desc    Get all leads with filtering
 * @access  Private
 */
router.get('/leads',
    authMiddleware,
    leadController.getLeads
);

/**
 * @route   GET /api/v1/leads/:id
 * @desc    Get lead by ID
 * @access  Private
 */
router.get('/leads/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid lead ID is required'),
    validateRequest,
    leadController.getLeadById
);

/**
 * @route   POST /api/v1/leads
 * @desc    Create new lead
 * @access  Private (Admin, Manager, Staff)
 */
router.post('/leads',
    authMiddleware,
    body('contactName').isString().trim().isLength({ min: 1 }).withMessage('Contact name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').isString().trim().isLength({ min: 10 }).withMessage('Valid phone is required'),
    body('source').isString().withMessage('Lead source is required'),
    validateRequest,
    leadController.createLead
);

/**
 * @route   PUT /api/v1/leads/:id
 * @desc    Update lead
 * @access  Private (Admin, Manager, Staff)
 */
router.put('/leads/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid lead ID is required'),
    validateRequest,
    leadController.updateLead
);

/**
 * @route   DELETE /api/v1/leads/:id
 * @desc    Delete lead
 * @access  Private (Admin, Manager)
 */
router.delete('/leads/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid lead ID is required'),
    validateRequest,
    leadController.deleteLead
);

/**
 * @route   PATCH /api/v1/leads/:id/score
 * @desc    Update lead score
 * @access  Private (Admin, Manager, Staff)
 */
router.patch('/leads/:id/score',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid lead ID is required'),
    body('factor').isString().withMessage('Scoring factor is required'),
    body('points').isNumeric().withMessage('Points are required'),
    body('reason').isString().withMessage('Reason is required'),
    validateRequest,
    leadController.updateLeadScore
);

/**
 * @route   PATCH /api/v1/leads/:id/assign
 * @desc    Assign lead to staff
 * @access  Private (Admin, Manager)
 */
router.patch('/leads/:id/assign',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid lead ID is required'),
    body('assignedTo').isMongoId().withMessage('Valid staff ID is required'),
    validateRequest,
    leadController.assignLead
);

export default router;