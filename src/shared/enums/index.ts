// User & Authentication Enums
export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    HQ_ADMIN = 'HQ_ADMIN',
    REGIONAL_ADMIN = 'REGIONAL_ADMIN',
    FRANCHISE_OWNER = 'FRANCHISE_OWNER',
    LOCATION_MANAGER = 'LOCATION_MANAGER',
    COACH = 'COACH',
    PARENT = 'PARENT',
    PARTNER_ADMIN = 'PARTNER_ADMIN',
    SUPPORT_STAFF = 'SUPPORT_STAFF',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    PENDING = 'PENDING',
}

// Organization Enums
export enum BusinessUnitType {
    GYM = 'GYM',
    SCHOOL = 'SCHOOL',
    CAMP = 'CAMP',
    EVENT = 'EVENT',
    PARTY = 'PARTY',
    ELITE_ACADEMY = 'ELITE_ACADEMY',
}

export enum LocationStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    COMING_SOON = 'COMING_SOON',
    TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
}

// Program Enums
export enum ProgramType {
    REGULAR_CLASS = 'REGULAR_CLASS',
    CAMP = 'CAMP',
    EVENT = 'EVENT',
    PRIVATE_LESSON = 'PRIVATE_LESSON',
    ASSESSMENT = 'ASSESSMENT',
    PARTY = 'PARTY',
}

export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    ELITE = 'ELITE',
}

export enum AgeGroup {
    TODDLER = 'TODDLER', // 2-4
    PRESCHOOL = 'PRESCHOOL', // 4-6
    JUNIOR = 'JUNIOR', // 6-9
    INTERMEDIATE = 'INTERMEDIATE', // 9-12
    TEEN = 'TEEN', // 12-18
}

// Booking & Enrollment Enums
export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
    WAITLISTED = 'WAITLISTED',
}

export enum EnrollmentType {
    TERM = 'TERM',
    ROLLING = 'ROLLING',
    DROP_IN = 'DROP_IN',
    TRIAL = 'TRIAL',
}

export enum CancellationReason {
    PARENT_REQUEST = 'PARENT_REQUEST',
    ILLNESS = 'ILLNESS',
    SCHEDULE_CONFLICT = 'SCHEDULE_CONFLICT',
    RELOCATION = 'RELOCATION',
    FINANCIAL = 'FINANCIAL',
    DISSATISFACTION = 'DISSATISFACTION',
    OTHER = 'OTHER',
}

// Payment Enums
export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
    WALLET = 'WALLET',
    PAYPAY = 'PAYPAY',
    LINE_PAY = 'LINE_PAY',
}

export enum BillingCycle {
    ONE_TIME = 'ONE_TIME',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    TERM = 'TERM',
    ANNUAL = 'ANNUAL',
}

// Scheduling Enums
export enum SessionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    RESCHEDULED = 'RESCHEDULED',
}

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

// Attendance Enums
export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    EXCUSED = 'EXCUSED',
    NO_SHOW = 'NO_SHOW',
}

// Notification Enums
export enum NotificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH',
    IN_APP = 'IN_APP',
}

export enum NotificationPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

// Safety & Incident Enums
export enum IncidentType {
    INJURY = 'INJURY',
    ILLNESS = 'ILLNESS',
    BEHAVIORAL = 'BEHAVIORAL',
    SAFETY_VIOLATION = 'SAFETY_VIOLATION',
    UNAUTHORIZED_PICKUP = 'UNAUTHORIZED_PICKUP',
    MISSING_CHILD = 'MISSING_CHILD',
    OTHER = 'OTHER',
}

export enum IncidentSeverity {
    MINOR = 'MINOR',
    MODERATE = 'MODERATE',
    SERIOUS = 'SERIOUS',
    CRITICAL = 'CRITICAL',
}

// General Enums
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
    PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum Currency {
    USD = 'USD',
    JPY = 'JPY',
    HKD = 'HKD',
    SGD = 'SGD',
    EUR = 'EUR',
    GBP = 'GBP',
}

export enum Language {
    EN = 'EN',
    JA = 'JA',
    ZH_HK = 'ZH_HK',
    ZH_CN = 'ZH_CN',
}

export enum RecordStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED',
}
