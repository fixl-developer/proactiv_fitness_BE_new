import { REGEX_PATTERNS } from '@shared/constants';

export class ValidationUtil {
    static isValidEmail(email: string): boolean {
        return REGEX_PATTERNS.EMAIL.test(email);
    }

    static isValidPhone(phone: string): boolean {
        return REGEX_PATTERNS.PHONE.test(phone);
    }

    static isValidPassword(password: string): boolean {
        return password.length >= 8 && REGEX_PATTERNS.PASSWORD.test(password);
    }

    static isValidAge(age: number, min: number = 2, max: number = 18): boolean {
        return age >= min && age <= max;
    }

    static sanitizeString(str: string): string {
        return str.trim().replace(/[<>]/g, '');
    }

    static isValidObjectId(id: string): boolean {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }

    static isValidDate(date: string | Date): boolean {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d.getTime());
    }

    static isValidTimeRange(startTime: string, endTime: string): boolean {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return false;
        }

        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return endMinutes > startMinutes;
    }

    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}
