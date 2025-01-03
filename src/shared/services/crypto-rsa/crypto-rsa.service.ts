import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as NodeRSA from 'node-rsa';
import * as xml2js from 'xml2js';

@Injectable()
export class CryptoRsaService {
    private key: NodeRSA;

    constructor() { }

    async initializeKeyFromXml(xmlKey: string): Promise<void> {
        const pemKey = await this.xmlToPem(xmlKey);
        this.key = new NodeRSA(pemKey, 'pkcs1-private-pem', {
            encryptionScheme: {
                scheme: 'pkcs1',
                hash: 'sha256',
            },
        });
    }


    formatPemKey(key: string): string {
        const formattedKey = key
            .replace(/(.{64})/g, '$1\n') // Break lines every 64 characters
            .replace(/\n$/, ''); // Remove the trailing newline, if any
        return `-----BEGIN RSA PRIVATE KEY-----\n${formattedKey}\n-----END RSA PRIVATE KEY-----`;
    }

    async xmlToPem(xmlKey: string): Promise<string> {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parsedKey = await parser.parseStringPromise(xmlKey);

        const rsaKey = parsedKey.RSAKeyValue;

        const modulus = Buffer.from(rsaKey.Modulus, 'base64').toString('base64');
        const exponent = Buffer.from(rsaKey.Exponent, 'base64').toString('base64');
        const d = Buffer.from(rsaKey.D, 'base64').toString('base64');
        const p = Buffer.from(rsaKey.P, 'base64').toString('base64');
        const q = Buffer.from(rsaKey.Q, 'base64').toString('base64');
        const dp = Buffer.from(rsaKey.DP, 'base64').toString('base64');
        const dq = Buffer.from(rsaKey.DQ, 'base64').toString('base64');
        const inverseQ = Buffer.from(rsaKey.InverseQ, 'base64').toString('base64');

        const keyData = `${modulus}${exponent}${d}${p}${q}${dp}${dq}${inverseQ}`;
        return this.formatPemKey(keyData);
    }

    toSHA256(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    signData(data: string): string {
        try {
            const signature = this.key.sign(data, 'base64', 'utf8');
            return signature;
        } catch (error) {
            console.error('Error signing data:', error);
            throw error;
        }
    }
}