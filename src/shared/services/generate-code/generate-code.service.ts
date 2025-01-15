import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GenerateCodeService {
    generateTrackingCode(): string {
        const uuid = uuidv4();
        const timestamp = Date.now().toString(); // Current timestamp
        return `${uuid}-${timestamp}`;
    }
}
