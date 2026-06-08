export interface IEncryptionService {
  encrypt(plain: string): string;
  decrypt(encrypted: string): string;
}
