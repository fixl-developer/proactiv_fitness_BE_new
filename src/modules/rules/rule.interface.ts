import { Document } from 'mongoose';

export enum RuleType {
    BOOKING = 'booking',
    CANCELLATION = 'cancellation',
    CAPACITY = 'capacity',
    SLA = 'sla',
    PRICING = 'pricing',
    PROMOTION = 'promotion',
    MAKEUP = 'makeup',
    WAITLIST = 'waitlist',
    ATTENDANCE = 'attendance',
    REFUND = 'refund'
}

export enum RuleStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DRAFT = 'draft',
    EXPIRED = 'expired'
}

export enum ConditionOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'not_equals',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
    LESS_THAN_OR_EQUAL = 'less_than_or_equal',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'not_contains',
    IN = 'in',
    NOT_IN = 'not_in',
    BETWEEN = 'between',
    IS_NULL = 'is_null',
    IS_NOT_NULL = 'is_not_null'
}

export enum ActionType {
    ALLOW = 'allow',
    DENY = 'deny',
    REQUIRE_APPROVAL = 'require_approval',
    APPLY_FEE = 'apply_fee',
    APPLY_DISCOUNT = 'apply_discount',
    SEND_NOTIFICATION = 'send_notification',
    CREATE_TASK = 'create_task',
    UPDATE_STATUS = 'update_status',
    TRANSFER_TO_WAITLIST = 'transfer_to_waitlist',
    AUTO_APPROVE = 'auto_approve'
}

export interface IRuleCondition {
    field: string; // e.g., 'user.membershipType', 'booking.hoursBeforeSession'
    operator: ConditionOperator;
    value: any;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface IRuleAction {
    type: ActionType;
    parameters: Record<string, any>;
    message?: string;
    priority: number; // Higher number = higher priority
}

export interface IRuleContext {
    userId?: string;
    programId?: string;
    sessionId?: string;
    bookingId?: string;
    locationId?: string;
    businessUnitId?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface IRuleEvaluationResult {
    ruleId: string;
    ruleName: string;
    matched: boolean;
    actions: IRuleAction[];
    message?: string;
    executedAt: Date;
}

export interface IPolicyEvaluationResult {
    allowed: boolean;
    actions: IRuleAction[];
    matchedRules: IRuleEvaluationResult[];
    messages: string[];
    fees: number;
    discounts: number;
    requiresApproval: boolean;
    approvalReason?: string;
}

export interface IRule extends Document {
    // Basic Information
    name: string;
    description: string;
    ruleType: RuleType;
    category: string; // e.g., 'membership', 'session', 'payment'

    // Scope
    businessUnitId?: string;
    locationIds: string[];
    programIds: string[];

    // Rule Logic
    conditions: IRuleCondition[];
    conditionLogic: 'AND' | 'OR'; // How to combine conditions
    actions: IRuleAction[];

    // Priority and Execution
    priority: number; // Higher number = higher priority
    stopOnMatch: boolean; // Stop evaluating other rules if this matches

    // Scheduling
    effectiveFrom: Date;
    effectiveTo?: Date;

    // Days and Times
    applicableDays: string[]; // ['monday', 'tuesday', etc.]
    applicableTimeSlots: {
        startTime: string;
        endTime: string;
    }[];

    // Status
    status: RuleStatus;

    // Versioning
    version: number;
    parentRuleId?: string; // For rule versioning

    // Usage Statistics
    statistics: {
        timesEvaluated: number;
        timesMatched: number;
        lastEvaluated?: Date;
        lastMatched?: Date;
    };

    // Audit
    createdBy: any;
    updatedBy: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPolicy extends Document {
    // Basic Information
    name: string;
    description: string;
    policyType: RuleType;

    // Scope
    businessUnitId?: string;
    locationIds: string[];
    programIds: string[];

    // Rules
    ruleIds: string[];
    ruleEvaluationOrder: 'priority' | 'creation_date' | 'custom';

    // Default Actions
    defaultAction: ActionType;
    defaultMessage?: string;

    // Status
    status: RuleStatus;

    // Effective Period
    effectiveFrom: Date;
    effectiveTo?: Date;

    // Statistics
    statistics: {
        timesEvaluated: number;
        averageEvaluationTime: number; // in milliseconds
        lastEvaluated?: Date;
    };

    // Audit
    createdBy: any;
    updatedBy: any;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface IRuleTemplate extends Document {
    name: string;
    description: string;
    ruleType: RuleType;
    category: string;

    // Template Structure
    conditionTemplate: {
        fields: string[];
        operators: ConditionOperator[];
        defaultValues: Record<string, any>;
    };

    actionTemplate: {
        availableActions: ActionType[];
        defaultParameters: Record<string, any>;
    };

    // Usage
    isPublic: boolean;
    usageCount: number;

    // Audit
    createdBy: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRuleFilter {
    ruleType?: RuleType;
    category?: string;
    status?: RuleStatus;
    businessUnitId?: string;
    locationId?: string;
    programId?: string;
    effectiveDate?: Date;
    searchText?: string;
}

export interface IPolicyFilter {
    policyType?: RuleType;
    status?: RuleStatus;
    businessUnitId?: string;
    locationId?: string;
    programId?: string;
    effectiveDate?: Date;
    searchText?: string;
}

// Specific rule interfaces for common use cases

export interface IBookingRule {
    advanceBookingHours: {
        min: number;
        max: number;
    };
    maxBookingsPerUser: number;
    maxBookingsPerSession: number;
    allowWaitlist: boolean;
    requiresApproval: boolean;
    blackoutDates: Date[];
}

export interface ICancellationRule {
    cancellationDeadlineHours: number;
    cancellationFeePercentage: number;
    freeCancellationsPerMonth: number;
    noShowFeeAmount: number;
    allowRescheduling: boolean;
    rescheduleDeadlineHours: number;
}

export interface ICapacityRule {
    minParticipants: number;
    maxParticipants: number;
    overbookingPercentage: number;
    waitlistCapacity: number;
    autoConfirmFromWaitlist: boolean;
}

export interface IPricingRule {
    basePrice: number;
    discountRules: {
        membershipType: string;
        discountPercentage: number;
    }[];
    surchargeRules: {
        condition: string;
        surchargeAmount: number;
    }[];
    dynamicPricing: {
        enabled: boolean;
        demandMultiplier: number;
        timeBasedPricing: boolean;
    };
}

export interface IPromotionRule {
    promotionCode: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usagePerUser?: number;
    stackable: boolean;
    eligiblePrograms: string[];
    eligibleMembershipTypes: string[];
}

export interface IMakeupRule {
    allowMakeupClasses: boolean;
    makeupDeadlineDays: number;
    maxMakeupsPerMonth: number;
    makeupFeeAmount: number;
    eligibleReasons: string[];
    requiresApproval: boolean;
    makeupClassRestrictions: {
        sameProgram: boolean;
        sameLevel: boolean;
        sameLocation: boolean;
    };
}

export interface IWaitlistRule {
    maxWaitlistSize: number;
    waitlistPriority: 'first_come_first_serve' | 'membership_level' | 'custom';
    autoConfirmationEnabled: boolean;
    confirmationTimeoutHours: number;
    waitlistFeeAmount: number;
    transferToAlternativePrograms: boolean;
}
