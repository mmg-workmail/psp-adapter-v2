import * as crypto from 'crypto';

export class Encryption {
    private readonly algorithm: string;
    private readonly secretKey: string;
    private readonly ivLength: number;

    constructor(secretKey: string, ivLength: number = 16, algorithm: string = 'aes-256-cbc') {
        if (secretKey.length !== 32) {
            throw new Error('ENCRYPTION_KEY must be 32 characters long');
        }

        this.algorithm = algorithm;
        this.secretKey = secretKey;
        this.ivLength = ivLength;
    }

    /**
     * Encrypt a plain text value.
     * @param plainText - The text to encrypt.
     * @returns The encrypted content as a string with the IV.
     */
    encrypt(plainText: string): string {
        const iv = crypto.randomBytes(this.ivLength); // Generate a random IV
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

        // Return the IV and encrypted content as a single base64 string
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    /**
     * Decrypt an encrypted value.
     * @param encryptedText - The encrypted text with IV (e.g., from `encrypt`).
     * @returns The decrypted plain text.
     */
    decrypt(encryptedText: string): string {
        const [ivHex, encryptedHex] = encryptedText.split(':');
        if (!ivHex || !encryptedHex) {
            throw new Error('Invalid encrypted text format');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);

        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString();
    }
}
