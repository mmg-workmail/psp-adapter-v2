import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GenerateCodeService {
    generateTrackingCode(): string {
        const uuid = uuidv4();
        const timestamp = Date.now().toString(); // Current timestamp
        return `${uuid}-${timestamp}`;
    }
    generateNumericCode(length: number = 12): string {
        const timestamp = Date.now().toString(); // Current timestamp
        const randomPart = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
        return `${timestamp}${randomPart}`.slice(0, length);
    }
}
