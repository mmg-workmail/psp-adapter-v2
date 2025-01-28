import * as CryptoJS from 'crypto-js';

export class SignatureForCoinBuy {

    public isValid(signature: string, payload: string, login: string, password: string): boolean {
        const generatedSignature = this.generateSignature(payload, login, password);
        return generatedSignature === signature;
    }

    public generateSignature(message: string, login: string, password: string): string {

        // Step 2: Generate hash secret
        const hashSecret = CryptoJS.SHA256(login + password); // Outputs a WordArray object

        // Step 3: Generate HMAC
        const signature = CryptoJS.HmacSHA256(message, hashSecret).toString(CryptoJS.enc.Hex);

        return signature;
    }
}
