import { body, param } from 'express-validator';
import { BusinessUnitType, LocationStatus, Language } from '@shared/enums';

// Country validations
export const createCountryValidation = [
    body('name').trim().notEmpty().withMessage('Country name is required'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Country code is required')
        .isLength({ min: 2, max: 2 })
        .withMessage('Country code must be 2 characters')
        .toUpperCase(),
    body('currency')
        .notEmpty()
        .withMessage('Currency is required')
        .toUpperCase()
        .matches(/^[A-Z]{3}$/)
        .withMessage('Currency must be a 3-letter ISO 4217 code (e.g., USD, ARS, INR)'),
    body('timezone').trim().notEmpty().withMessage('Timezone is required'),
    body('languages')
        .isArray({ min: 1 })
        .withMessage('At least one language is required')
        .custom((languages) => languages.every((lang: string) => Object.values(Language).includes(lang as Language)))
        .withMessage('Invalid language'),
];

export const updateCountryValidation = [
    param('id').isMongoId().withMessage('Invalid country ID'),
    body('name').optional().trim().notEmpty().withMessage('Country name cannot be empty'),
    body('currency')
        .optional()
        .toUpperCase()
        .matches(/^[A-Z]{3}$/)
        .withMessage('Currency must be a 3-letter ISO 4217 code (e.g., USD, ARS, INR)'),
    body('timezone').optional().trim().notEmpty().withMessage('Timezone cannot be empty'),
    body('languages')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one language is required')
        .custom((languages) => languages.every((lang: string) => Object.values(Language).includes(lang as Language)))
        .withMessage('Invalid language'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

// Region validations
export const createRegionValidation = [
    body('name').trim().notEmpty().withMessage('Region name is required'),
    body('code').trim().notEmpty().withMessage('Region code is required'),
    body('countryId').isMongoId().withMessage('Invalid country ID'),
    body('description').optional().trim(),
];

export const updateRegionValidation = [
    param('id').isMongoId().withMessage('Invalid region ID'),
    body('name').optional().trim().notEmpty().withMessage('Region name cannot be empty'),
    body('code').optional().trim().notEmpty().withMessage('Region code cannot be empty'),
    body('description').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

// Business Unit validations
export const createBusinessUnitValidation = [
    body('name').trim().notEmpty().withMessage('Business unit name is required'),
    body('code').trim().notEmpty().withMessage('Business unit code is required'),
    body('type')
        .notEmpty()
        .withMessage('Business unit type is required')
        .isIn(Object.values(BusinessUnitType))
        .withMessage('Invalid business unit type'),
    body('countryId').isMongoId().withMessage('Invalid country ID'),
    body('regionId').optional().isMongoId().withMessage('Invalid region ID'),
    body('description').optional().trim(),
    body('settings').optional().isObject().withMessage('Settings must be an object'),
];

export const updateBusinessUnitValidation = [
    param('id').isMongoId().withMessage('Invalid business unit ID'),
    body('name').optional().trim().notEmpty().withMessage('Business unit name cannot be empty'),
    body('code').optional().trim().notEmpty().withMessage('Business unit code cannot be empty'),
    body('description').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('settings').optional().isObject().withMessage('Settings must be an object'),
];

// Location validations
export const createLocationValidation = [
    body('name').trim().notEmpty().withMessage('Location name is required'),
    body('code').trim().notEmpty().withMessage('Location code is required'),
    body('businessUnitId').isMongoId().withMessage('Invalid business unit ID'),
    body('countryId').isMongoId().withMessage('Invalid country ID'),
    body('regionId').optional().isMongoId().withMessage('Invalid region ID'),
    body('address').isObject().withMessage('Address is required'),
    body('address.street').trim().notEmpty().withMessage('Street is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.postalCode').trim().notEmpty().withMessage('Postal code is required'),
    // contactInfo + its phone/email are optional. Mongoose schema treats them as
    // optional Strings, so the API contract should match. Internal/warehouse
    // locations save without contact details; customer-facing pages already
    // hide the "Call now"/"Email" rows when these are absent.
    body('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
    body('contactInfo.email').optional({ values: 'falsy' }).isEmail().withMessage('Email must be a valid address when provided'),
    body('contactInfo.phone').optional({ values: 'falsy' }).isString().withMessage('Phone must be a string when provided'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('operatingHours').optional().isObject().withMessage('Operating hours must be an object when provided'),
];

export const updateLocationValidation = [
    param('id').isMongoId().withMessage('Invalid location ID'),
    body('name').optional().trim().notEmpty().withMessage('Location name cannot be empty'),
    body('code').optional().trim().notEmpty().withMessage('Location code cannot be empty'),
    body('address').optional().isObject().withMessage('Address must be an object'),
    body('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
    body('status')
        .optional()
        .isIn(Object.values(LocationStatus))
        .withMessage('Invalid location status'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('operatingHours').optional().isObject().withMessage('Operating hours must be an object'),
];

// Room validations
export const createRoomValidation = [
    body('name').trim().notEmpty().withMessage('Room name is required'),
    body('code').trim().notEmpty().withMessage('Room code is required'),
    body('locationId').isMongoId().withMessage('Invalid location ID'),
    body('type').trim().notEmpty().withMessage('Room type is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('area').optional().isFloat({ min: 0 }).withMessage('Area must be positive'),
    body('floor').optional().isInt().withMessage('Floor must be an integer'),
    body('description').optional().trim(),
    body('equipment').optional().isArray().withMessage('Equipment must be an array'),
];

export const updateRoomValidation = [
    param('id').isMongoId().withMessage('Invalid room ID'),
    body('name').optional().trim().notEmpty().withMessage('Room name cannot be empty'),
    body('code').optional().trim().notEmpty().withMessage('Room code cannot be empty'),
    body('type').optional().trim().notEmpty().withMessage('Room type cannot be empty'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('area').optional().isFloat({ min: 0 }).withMessage('Area must be positive'),
    body('floor').optional().isInt().withMessage('Floor must be an integer'),
    body('description').optional().trim(),
    body('equipment').optional().isArray().withMessage('Equipment must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

// Holiday Calendar validations
export const createHolidayCalendarValidation = [
    body('name').trim().notEmpty().withMessage('Calendar name is required'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
    body('countryId').isMongoId().withMessage('Invalid country ID'),
    body('regionId').optional().isMongoId().withMessage('Invalid region ID'),
    body('holidays').isArray({ min: 1 }).withMessage('At least one holiday is required'),
    body('holidays.*.name').trim().notEmpty().withMessage('Holiday name is required'),
    body('holidays.*.date').isISO8601().withMessage('Valid date is required'),
    body('holidays.*.isRecurring').isBoolean().withMessage('isRecurring must be boolean'),
    body('holidays.*.affectsScheduling').isBoolean().withMessage('affectsScheduling must be boolean'),
];

export const updateHolidayCalendarValidation = [
    param('id').isMongoId().withMessage('Invalid calendar ID'),
    body('name').optional().trim().notEmpty().withMessage('Calendar name cannot be empty'),
    body('holidays').optional().isArray({ min: 1 }).withMessage('At least one holiday is required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

// Term validations
export const createTermValidation = [
    body('name').trim().notEmpty().withMessage('Term name is required'),
    body('code').trim().notEmpty().withMessage('Term code is required'),
    body('businessUnitId').isMongoId().withMessage('Invalid business unit ID'),
    body('locationId').optional().isMongoId().withMessage('Invalid location ID'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate')
        .isISO8601()
        .withMessage('Valid end date is required')
        .custom((endDate, { req }) => new Date(endDate) > new Date(req.body.startDate))
        .withMessage('End date must be after start date'),
    body('registrationStartDate').optional().isISO8601().withMessage('Valid registration start date required'),
    body('registrationEndDate').optional().isISO8601().withMessage('Valid registration end date required'),
    body('holidayCalendarId').optional().isMongoId().withMessage('Invalid holiday calendar ID'),
    body('excludedDates').optional().isArray().withMessage('Excluded dates must be an array'),
    body('pricingMultiplier').optional().isFloat({ min: 0 }).withMessage('Pricing multiplier must be positive'),
];

export const updateTermValidation = [
    param('id').isMongoId().withMessage('Invalid term ID'),
    body('name').optional().trim().notEmpty().withMessage('Term name cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('registrationStartDate').optional().isISO8601().withMessage('Valid registration start date required'),
    body('registrationEndDate').optional().isISO8601().withMessage('Valid registration end date required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('allowEnrollment').optional().isBoolean().withMessage('allowEnrollment must be boolean'),
    body('excludedDates').optional().isArray().withMessage('Excluded dates must be an array'),
    body('pricingMultiplier').optional().isFloat({ min: 0 }).withMessage('Pricing multiplier must be positive'),
];

// Common ID param validation
export const idParamValidation = [
    param('id').isMongoId().withMessage('Invalid ID'),
];
