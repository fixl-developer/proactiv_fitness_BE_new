export interface CreateReferralLinkDTO {
    parentId: string;
}

export interface TrackReferralDTO {
    referralCode: string;
    newParentId: string;
}

export interface RedeemRewardDTO {
    parentId: string;
    rewardId: string;
}

export interface AddLoyaltyPointsDTO {
    parentId: string;
    points: number;
    reason: string;
}

export interface CreateChallengeDTO {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    objective: string;
    reward: number;
}

export interface JoinChallengeDTO {
    challengeId: string;
    parentId: string;
}
