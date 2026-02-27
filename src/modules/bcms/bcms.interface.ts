import { Document } from 'mongoose';
import { BusinessUnitType, LocationStatus, Currency, Language } from '@shared/enums';
import { IAddress, IContactInfo } from '@shared/interfaces/common.interface';

// ==================== COUNTRY ====================
export interface ICountry extends Document {
    name: string;
    code: string; // ISO 3166-1 alpha-2 (e.g., JP, US, SG)
    currency: Currency;
    timezone: string;
    languages: Language[];
    isActive: boolean;
    metadata?: Record<string, any>;
}

export interface ICountryCreate {
    name: string;
    code: string;
    currency: Currency;
    timezone: string;
    languages: Language[];
}

export interface ICountryUpdate {
    name?: string;
    currency?: Currency;
    timezone?: string;
    languages?: Language[];
    isActive?: boolean;
}

// ==================== REGION ====================
export interface IRegion extends Document {
    name: string;
    code: string;
    countryId: string;
    description?: string;
    isActive: boolean;
    metadata?: Record<string, any>;
}

export interface IRegionCreate {
    name: string;
    code: string;
    countryId: string;
    description?: string;
}

export interface IRegionUpdate {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
}

// ==================== BUSINESS UNIT ====================
export interface IBusinessUnit extends Document {
    name: string;
    code: string;
    type: BusinessUnitType;
    countryId: string;
    regionId?: string;
    description?: string;
    isActive: boolean;
    settings?: {
        defaultCapacity?: number;
        defaultDuration?: number; // in minutes
        allowOnlineBooking?: boolean;
        requireApproval?: boolean;
        cancellationHours?: number;
    };
    metadata?: Record<string, any>;
}

export interface IBusinessUnitCreate {
    name: string;
    code: string;
    type: BusinessUnitType;
    countryId: string;
    regionId?: string;
    description?: string;
    settings?: IBusinessUnit['settings'];
}

export interface IBusinessUnitUpdate {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
    settings?: IBusinessUnit['settings'];
}

// ==================== LOCATION/CENTER ====================
export interface ILocation extends Document {
    name: string;
    code: string;
    businessUnitId: string;
    countryId: string;
    regionId?: string;

    // Contact & Address
    address: IAddress;
    contactInfo: IContactInfo;

    // Status & Settings
    status: LocationStatus;
    capacity: number;

    // Operating Hours
    operatingHours: {
        [key: string]: { // day of week
            isOpen: boolean;
            openTime: string; // HH:mm
            closeTime: string; // HH:mm
        };
    };

    // Facilities
    facilities?: string[];
    amenities?: string[];

    // Images
    images?: string[];
    coverImage?: string;

    // Settings
    settings?: {
        allowOnlineBooking?: boolean;
        requireApproval?: boolean;
        autoConfirm?: boolean;
        maxAdvanceBookingDays?: number;
        minAdvanceBookingHours?: number;
    };

    metadata?: Record<string, any>;
}

export interface ILocationCreate {
    name: string;
    code: string;
    businessUnitId: string;
    countryId: string;
    regionId?: string;
    address: IAddress;
    contactInfo: IContactInfo;
    capacity: number;
    operatingHours: ILocation['operatingHours'];
    facilities?: string[];
    amenities?: string[];
    settings?: ILocation['settings'];
}

export interface ILocationUpdate {
    name?: string;
    code?: string;
    address?: IAddress;
    contactInfo?: IContactInfo;
    status?: LocationStatus;
    capacity?: number;
    operatingHours?: ILocation['operatingHours'];
    facilities?: string[];
    amenities?: string[];
    images?: string[];
    coverImage?: string;
    settings?: ILocation['settings'];
}

// ==================== ROOM/RESOURCE ====================
export interface IRoom extends Document {
    name: string;
    code: string;
    locationId: string;
    type: string; // e.g., 'TRAINING_ROOM', 'GYM_FLOOR', 'PARTY_ROOM'
    capacity: number;
    area?: number; // in square meters
    floor?: number;
    description?: string;
    equipment?: string[];
    isActive: boolean;
    metadata?: Record<string, any>;
}

export interface IRoomCreate {
    name: string;
    code: string;
    locationId: string;
    type: string;
    capacity: number;
    area?: number;
    floor?: number;
    description?: string;
    equipment?: string[];
}

export interface IRoomUpdate {
    name?: string;
    code?: string;
    type?: string;
    capacity?: number;
    area?: number;
    floor?: number;
    description?: string;
    equipment?: string[];
    isActive?: boolean;
}

// ==================== HOLIDAY CALENDAR ====================
export interface IHoliday {
    name: string;
    date: Date;
    isRecurring: boolean; // if true, repeats every year
    affectsScheduling: boolean;
}

export interface IHolidayCalendar extends Document {
    name: string;
    year: number;
    countryId: string;
    regionId?: string;
    holidays: IHoliday[];
    isActive: boolean;
    metadata?: Record<string, any>;
}

export interface IHolidayCalendarCreate {
    name: string;
    year: number;
    countryId: string;
    regionId?: string;
    holidays: IHoliday[];
}

export interface IHolidayCalendarUpdate {
    name?: string;
    holidays?: IHoliday[];
    isActive?: boolean;
}

// ==================== TERM ====================
export interface ITerm extends Document {
    name: string;
    code: string;
    businessUnitId: string;
    locationId?: string;

    // Dates
    startDate: Date;
    endDate: Date;
    registrationStartDate?: Date;
    registrationEndDate?: Date;

    // Settings
    weeks: number;
    isActive: boolean;
    allowEnrollment: boolean;

    // Holiday Calendar
    holidayCalendarId?: string;
    excludedDates?: Date[]; // Additional dates to exclude

    // Pricing
    pricingMultiplier?: number; // e.g., 1.1 for 10% increase

    metadata?: Record<string, any>;
}

export interface ITermCreate {
    name: string;
    code: string;
    businessUnitId: string;
    locationId?: string;
    startDate: Date;
    endDate: Date;
    registrationStartDate?: Date;
    registrationEndDate?: Date;
    holidayCalendarId?: string;
    excludedDates?: Date[];
    pricingMultiplier?: number;
}

export interface ITermUpdate {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    registrationStartDate?: Date;
    registrationEndDate?: Date;
    isActive?: boolean;
    allowEnrollment?: boolean;
    excludedDates?: Date[];
    pricingMultiplier?: number;
}

// ==================== QUERY INTERFACES ====================
export interface ICountryQuery {
    isActive?: boolean;
    search?: string;
}

export interface IRegionQuery {
    countryId?: string;
    isActive?: boolean;
    search?: string;
}

export interface IBusinessUnitQuery {
    countryId?: string;
    regionId?: string;
    type?: BusinessUnitType;
    isActive?: boolean;
    search?: string;
}

export interface ILocationQuery {
    businessUnitId?: string;
    countryId?: string;
    regionId?: string;
    status?: LocationStatus;
    search?: string;
}

export interface IRoomQuery {
    locationId?: string;
    type?: string;
    isActive?: boolean;
    minCapacity?: number;
    search?: string;
}

export interface IHolidayCalendarQuery {
    countryId?: string;
    regionId?: string;
    year?: number;
    isActive?: boolean;
}

export interface ITermQuery {
    businessUnitId?: string;
    locationId?: string;
    isActive?: boolean;
    allowEnrollment?: boolean;
    year?: number;
    current?: boolean; // if true, return current/upcoming terms
}

// ==================== RESPONSE INTERFACES ====================
export interface ICountryResponse {
    id: string;
    name: string;
    code: string;
    currency: Currency;
    timezone: string;
    languages: Language[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRegionResponse {
    id: string;
    name: string;
    code: string;
    countryId: string;
    country?: ICountryResponse;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBusinessUnitResponse {
    id: string;
    name: string;
    code: string;
    type: BusinessUnitType;
    countryId: string;
    regionId?: string;
    country?: ICountryResponse;
    region?: IRegionResponse;
    description?: string;
    isActive: boolean;
    settings?: IBusinessUnit['settings'];
    createdAt: Date;
    updatedAt: Date;
}

export interface ILocationResponse {
    id: string;
    name: string;
    code: string;
    businessUnitId: string;
    businessUnit?: IBusinessUnitResponse;
    countryId: string;
    regionId?: string;
    address: IAddress;
    contactInfo: IContactInfo;
    status: LocationStatus;
    capacity: number;
    operatingHours: ILocation['operatingHours'];
    facilities?: string[];
    amenities?: string[];
    images?: string[];
    coverImage?: string;
    settings?: ILocation['settings'];
    createdAt: Date;
    updatedAt: Date;
}

export interface IRoomResponse {
    id: string;
    name: string;
    code: string;
    locationId: string;
    location?: ILocationResponse;
    type: string;
    capacity: number;
    area?: number;
    floor?: number;
    description?: string;
    equipment?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IHolidayCalendarResponse {
    id: string;
    name: string;
    year: number;
    countryId: string;
    regionId?: string;
    country?: ICountryResponse;
    region?: IRegionResponse;
    holidays: IHoliday[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITermResponse {
    id: string;
    name: string;
    code: string;
    businessUnitId: string;
    locationId?: string;
    businessUnit?: IBusinessUnitResponse;
    location?: ILocationResponse;
    startDate: Date;
    endDate: Date;
    registrationStartDate?: Date;
    registrationEndDate?: Date;
    weeks: number;
    isActive: boolean;
    allowEnrollment: boolean;
    holidayCalendarId?: string;
    excludedDates?: Date[];
    pricingMultiplier?: number;
    createdAt: Date;
    updatedAt: Date;
}
