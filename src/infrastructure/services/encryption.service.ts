import { Injectable } from '@nestjs/common';
import { IEncryptionService } from '@domain/ports/IEncryptionService.interface';
import * as crypto from 'node:crypto';

@Injectable()
export class EncryptionService implements IEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor() {
    const raw = process.env.EMAIL_ENCRYPTION_KEY ?? '';
    if (!raw) {
      throw new Error('EMAIL_ENCRYPTION_KEY env var is not set');
    }
    this.key = Buffer.from(raw, 'hex');
    if (this.key.length !== 32) {
      throw new Error(
        'EMAIL_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
      );
    }
  }

  encrypt(plain: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, dataHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      'utf8',
    );
  }
}
