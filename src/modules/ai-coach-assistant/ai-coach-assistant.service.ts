export class AICoachAssistantService {
    async getRecommendations(userId: string, data: any): Promise<any> {
        return { success: true, data: { recommendations: [], userId } };
    }

    async startSession(userId: string, data: any): Promise<any> {
        return { success: true, data: { sessionId: 'stub', userId } };
    }

    async sendMessage(sessionId: string, message: string): Promise<any> {
        return { success: true, data: { response: 'AI coaching is not configured yet.', sessionId } };
    }

    async getSessionHistory(userId: string): Promise<any> {
        return { success: true, data: [] };
    }
}
