import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../../shared/services/base.service';
import { AppError } from '../../shared/utils/app-error';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { EmergencyContact } from './emergency-contacts.model';
import {
    IEmergencyContact,
    ICreateEmergencyContactRequest,
    IUpdateEmergencyContactRequest,
    EmergencyContactStatus
} from './emergency-contacts.interface';

@Injectable()
export class EmergencyContactsService extends BaseService<IEmergencyContact> {
    constructor(
        @InjectModel(EmergencyContact.name) private emergencyContactModel: Model<IEmergencyContact>
    ) {
        super(emergencyContactModel);
    }

    /**
     * Create emergency contact
     */
    async createEmergencyContact(contactRequest: ICreateEmergencyContactRequest, createdBy: string): Promise<IEmergencyContact> {
        try {
            const contact = new this.emergencyContactModel({
                ...contactRequest,
                status: EmergencyContactStatus.PENDING,
                businessUnitId: await this.getBusinessUnitId(contactRequest.studentId),
                createdBy,
                updatedBy: createdBy
            });

            await contact.save();
            return contact;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create emergency contact',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get emergency contacts for a location
     */
    async getLocationEmergencyContacts(locationId: string, filters?: any): Promise<IEmergencyContact[]> {
        try {
            const query: any = { businessUnitId: locationId };

            if (filters?.status) {
                query.status = filters.status;
            }

            if (filters?.studentId) {
                query.studentId = filters.studentId;
            }

            return await this.emergencyContactModel
                .find(query)
                .populate('studentId', 'firstName lastName')
                .sort({ createdAt: -1 })
                .exec();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to fetch emergency contacts',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Verify emergency contact
     */
    async verifyContact(contactId: string, verifiedBy: string): Promise<IEmergencyContact> {
        try {
            const contact = await this.emergencyContactModel.findById(contactId);
            if (!contact) {
                throw new AppError('Emergency contact not found', HTTP_STATUS.NOT_FOUND);
            }

            contact.status = EmergencyContactStatus.VERIFIED;
            contact.verifiedDate = new Date();
            contact.verifiedBy = verifiedBy;
            contact.updatedBy = verifiedBy;

            await contact.save();
            return contact;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to verify contact',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update emergency contact
     */
    async updateEmergencyContact(
        contactId: string,
        updateRequest: IUpdateEmergencyContactRequest,
        updatedBy: string
    ): Promise<IEmergencyContact> {
        try {
            const contact = await this.emergencyContactModel.findByIdAndUpdate(
                contactId,
                { ...updateRequest, updatedBy },
                { new: true }
            );

            if (!contact) {
                throw new AppError('Emergency contact not found', HTTP_STATUS.NOT_FOUND);
            }

            return contact;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update emergency contact',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get emergency contacts by student
     */
    async getStudentEmergencyContacts(studentId: string): Promise<IEmergencyContact[]> {
        try {
            return await this.emergencyContactModel
                .find({ studentId, status: EmergencyContactStatus.VERIFIED })
                .sort({ isAuthorizedPickup: -1, createdAt: -1 })
                .exec();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to fetch student emergency contacts',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get business unit ID for student
     */
    private async getBusinessUnitId(studentId: string): Promise<string> {
        // Implementation would fetch student's business unit
        return 'default-location-id';
    }
}