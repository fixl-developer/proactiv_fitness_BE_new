export class InitiateExitDTO {
    userId: string;
    tenantId: string;
    reason: string;
    requestedDate?: Date;
}

export class ExitProtocolResponseDTO {
    exitId: string;
    userId: string;
    status: 'pending' | 'approved' | 'completed';
    requestedDate: Date;
    approvalDate?: Date;
    completionDate?: Date;
}
