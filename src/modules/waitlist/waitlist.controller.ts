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
import { WaitlistService } from './waitlist.service';
import {
    ICreateWaitlistEntryRequest,
    IUpdateWaitlistEntryRequest,
    IWaitlistFilters
} from './waitlist.interface';

@ApiTags('Waitlist')
@Controller('waitlist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WaitlistController {
    constructor(private readonly waitlistService: WaitlistService) { }

    @Post()
    @Roles(UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
    @ApiOperation({ summary: 'Add student to waitlist' })
    @ApiResponse({ status: 201, description: 'Student added to waitlist successfully' })
    async createWaitlistEntry(
        @Body() createRequest: ICreateWaitlistEntryRequest,
        @Request() req: any
    ) {
        const entry = await this.waitlistService.createWaitlistEntry(createRequest, req.user.id);
        return {
            success: true,
            message: 'Student added to waitlist successfully',
            data: entry
        };
    }
    @Get('location/:locationId')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.SUPPORT_STAFF)
    @ApiOperation({ summary: 'Get waitlist entries for location' })
    @ApiResponse({ status: 200, description: 'Waitlist entries retrieved successfully' })
    async getLocationWaitlist(
        @Param('locationId') locationId: string,
        @Query() filters: IWaitlistFilters
    ) {
        const entries = await this.waitlistService.getLocationWaitlist(locationId, filters);
        return {
            success: true,
            message: 'Waitlist entries retrieved successfully',
            data: entries
        };
    }

    @Put(':id/offer')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Offer spot to waitlisted student' })
    @ApiResponse({ status: 200, description: 'Spot offered successfully' })
    async offerSpot(
        @Param('id') entryId: string,
        @Request() req: any
    ) {
        const entry = await this.waitlistService.offerSpot(entryId, req.user.id);
        return {
            success: true,
            message: 'Spot offered successfully',
            data: entry
        };
    }

    @Put(':id/accept')
    @Roles(UserRole.PARENT, UserRole.LOCATION_MANAGER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Accept waitlist offer' })
    @ApiResponse({ status: 200, description: 'Offer accepted successfully' })
    async acceptOffer(@Param('id') entryId: string) {
        const entry = await this.waitlistService.acceptOffer(entryId);
        return {
            success: true,
            message: 'Offer accepted successfully',
            data: entry
        };
    }

    @Delete(':id')
    @Roles(UserRole.LOCATION_MANAGER, UserRole.ADMIN, UserRole.PARENT)
    @ApiOperation({ summary: 'Remove from waitlist' })
    @ApiResponse({ status: 200, description: 'Removed from waitlist successfully' })
    async removeFromWaitlist(
        @Param('id') entryId: string,
        @Request() req: any
    ) {
        await this.waitlistService.removeFromWaitlist(entryId, req.user.id);
        return {
            success: true,
            message: 'Removed from waitlist successfully'
        };
    }
}