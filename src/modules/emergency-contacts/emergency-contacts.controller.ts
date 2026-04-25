import { EmergencyContactsService } from './emergency-contacts.service';
import {
    ICreateEmergencyContactRequest,
    IUpdateEmergencyContactRequest,
    IEmergencyContactFilters
} from './emergency-contacts.interface';

export class EmergencyContactsController {
    constructor(private readonly emergencyContactsService: EmergencyContactsService) { }

    async createEmergencyContact(createRequest: ICreateEmergencyContactRequest, req: any) {
        const userId = req?.user?.id || req?.user?._id || 'system';
        const contact = await this.emergencyContactsService.createEmergencyContact(createRequest, userId);
        return {
            success: true,
            message: 'Emergency contact created successfully',
            data: contact
        };
    }

    async getLocationEmergencyContacts(locationId: string, filters: IEmergencyContactFilters) {
        const contacts = await this.emergencyContactsService.getLocationEmergencyContacts(locationId, filters);
        return {
            success: true,
            message: 'Emergency contacts retrieved successfully',
            data: contacts
        };
    }

    async getStudentEmergencyContacts(studentId: string) {
        const contacts = await this.emergencyContactsService.getStudentEmergencyContacts(studentId);
        return {
            success: true,
            message: 'Student emergency contacts retrieved successfully',
            data: contacts
        };
    }

    async verifyContact(contactId: string, req: any) {
        const userId = req?.user?.id || req?.user?._id || 'system';
        const contact = await this.emergencyContactsService.verifyContact(contactId, userId);
        return {
            success: true,
            message: 'Emergency contact verified successfully',
            data: contact
        };
    }

    async updateEmergencyContact(
        contactId: string,
        updateRequest: IUpdateEmergencyContactRequest,
        req: any
    ) {
        const userId = req?.user?.id || req?.user?._id || 'system';
        const contact = await this.emergencyContactsService.updateEmergencyContact(contactId, updateRequest, userId);
        return {
            success: true,
            message: 'Emergency contact updated successfully',
            data: contact
        };
    }

    async deleteEmergencyContact(contactId: string) {
        await this.emergencyContactsService.delete(contactId);
        return {
            success: true,
            message: 'Emergency contact deleted successfully'
        };
    }
}
