import * as crypto from 'crypto-js';

export class SignatureForBractagon {

    private readonly secretKey: string;

    constructor(secretKey: string) {
        this.secretKey = secretKey;
    }

    public isValid(payload: any, signature: string): boolean {
        const generatedSignature = this.generateSignature(payload);
        return generatedSignature === signature;
    }

    public generateSignature(requestData: any) {
        // Create a sorted query string from requestData
        let query = Object.keys(requestData)
            .sort()
            .reduce((result, key) => result + key + '=' + requestData[key] + '&', "")
            .slice(0, -1);
        let signature = crypto.SHA1(query + this.secretKey).toString(crypto.enc.Hex).toUpperCase();

        return signature;
    }

}
