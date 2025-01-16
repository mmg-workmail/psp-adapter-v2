import * as CryptoJS from 'crypto-js';

export class SignatureForCoinBuy {

    public isValid(signature: string, payload: string, login: string, password: string): boolean {
        const generatedSignature = this.generateSignature(payload, login, password);
        return generatedSignature === signature;
    }

    public generateSignature(requestData: string, login: string, password: string): string {
        // Generate SHA-256 hash of login and password
        const hashSecret = CryptoJS.SHA256(login + password).toString(CryptoJS.enc.Hex);

        // Generate HMAC with SHA-256
        const signature = CryptoJS.HmacSHA256(requestData, hashSecret).toString(CryptoJS.enc.Hex);

        return signature;
    }
}
