import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums';
import { EmergencyContactsService } from './emergency-contacts.service';
import {
    ICreateEmergencyContactRequest,
    IUpdateEmergencyContactRequest,
    IEmergencyContactFilters
} from './emergency-contacts.interface';

@ApiTags('Emergency Contacts')
@Controller('emergency-contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmergencyContactsController {
    constructor(private readonly emergencyContactsService: EmergencyContactsService) { }

    @Post()
    @Roles(UserRole.LOCATION_MANAGER, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.PARENT)
    @ApiOperation({ summary: 'Create emergency contact' })
    @ApiResponse({ status: 201, description: 'Emergency contact created successfully' })
    async createEmergencyContact(
        @Body() createRequest: ICreateEmergencyContactRequest,
        @Request() req: any
    ) {
        const contact = await this.emergencyContactsService.createEmergencyContact(createRequest, req.user.id);
        return {
            success: true,
            message: 'Emergency contact created successfully',
            data: contact
        };
    }
    @Get('location/:locationId')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.SUPER_ADMIN, UserRole.STAFF)
    @ApiOperation({ summary: 'Get emergency contacts for location' })
    @ApiResponse({ status: 200, description: 'Emergency contacts retrieved successfully' })
    async getLocationEmergencyContacts(
        @Param('locationId') locationId: string,
        @Query() filters: IEmergencyContactFilters
    ) {
        const contacts = await this.emergencyContactsService.getLocationEmergencyContacts(locationId, filters);
        return {
            success: true,
            message: 'Emergency contacts retrieved successfully',
            data: contacts
        };
    }

    @Get('student/:studentId')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.PARENT)
    @ApiOperation({ summary: 'Get emergency contacts for student' })
    @ApiResponse({ status: 200, description: 'Student emergency contacts retrieved successfully' })
    async getStudentEmergencyContacts(@Param('studentId') studentId: string) {
        const contacts = await this.emergencyContactsService.getStudentEmergencyContacts(studentId);
        return {
            success: true,
            message: 'Student emergency contacts retrieved successfully',
            data: contacts
        };
    }

    @Put(':id/verify')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Verify emergency contact' })
    @ApiResponse({ status: 200, description: 'Emergency contact verified successfully' })
    async verifyContact(
        @Param('id') contactId: string,
        @Request() req: any
    ) {
        const contact = await this.emergencyContactsService.verifyContact(contactId, req.user.id);
        return {
            success: true,
            message: 'Emergency contact verified successfully',
            data: contact
        };
    }

    @Put(':id')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.SUPER_ADMIN, UserRole.PARENT)
    @ApiOperation({ summary: 'Update emergency contact' })
    @ApiResponse({ status: 200, description: 'Emergency contact updated successfully' })
    async updateEmergencyContact(
        @Param('id') contactId: string,
        @Body() updateRequest: IUpdateEmergencyContactRequest,
        @Request() req: any
    ) {
        const contact = await this.emergencyContactsService.updateEmergencyContact(contactId, updateRequest, req.user.id);
        return {
            success: true,
            message: 'Emergency contact updated successfully',
            data: contact
        };
    }

    @Delete(':id')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.SUPER_ADMIN, UserRole.PARENT)
    @ApiOperation({ summary: 'Delete emergency contact' })
    @ApiResponse({ status: 200, description: 'Emergency contact deleted successfully' })
    async deleteEmergencyContact(@Param('id') contactId: string) {
        await this.emergencyContactsService.delete(contactId);
        return {
            success: true,
            message: 'Emergency contact deleted successfully'
        };
    }
}