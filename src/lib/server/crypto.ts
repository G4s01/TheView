import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '$env/dynamic/private';

// HASHING for admin password (one-way)
export function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

// ENCRYPTION for third-party passwords (two-way)
const ALGORITHM = 'aes-256-gcm';

function getSecretKey(): Buffer {
    let secretStr = env.APP_SECRET;
    
    // Fallback: auto-generate and append to .env if missing
    if (!secretStr || secretStr.length < 32) {
        const envPath = path.resolve('.env');
        if (fs.existsSync(envPath)) {
            const currentEnv = fs.readFileSync(envPath, 'utf-8');
            if (!currentEnv.includes('APP_SECRET=')) {
                secretStr = crypto.randomBytes(32).toString('hex');
                fs.appendFileSync(envPath, `\n# Chiave generata automaticamente per crittografia\nAPP_SECRET="${secretStr}"\n`);
                console.log("Generata nuova APP_SECRET in .env");
            } else {
                // Se c'è ma è corta, non possiamo fare molto senza rompere le cose, usiamo un fallback
                secretStr = crypto.createHash('sha256').update(secretStr || 'fallback_secret').digest('hex');
            }
        } else {
            secretStr = crypto.randomBytes(32).toString('hex');
            fs.writeFileSync(envPath, `APP_SECRET="${secretStr}"\n`);
        }
    }
    
    // Assicuriamoci che sia esattamente 32 bytes
    return crypto.createHash('sha256').update(secretStr).digest();
}

export function encryptString(text: string): string {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(16);
        const key = getSecretKey();
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (e) {
        console.error("Encryption failed", e);
        return text;
    }
}

export function decryptString(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText; // Probabilmente è in chiaro
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) return encryptedText;
        
        const [ivHex, authTagHex, encryptedHex] = parts;
        const key = getSecretKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error("Decryption failed", e);
        return encryptedText; // Fallback al ritorno della stringa originale (potrebbe essere corrotta o la chiave è cambiata)
    }
}
