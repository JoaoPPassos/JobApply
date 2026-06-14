import type { User } from '@domain/entities/User.entity';

export type AuthTokenPayload = {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
};

export type PasswordResetTokenPayload = {
  sub: string;
  email: string;
};

export type EmailConfirmationTokenPayload = {
  email: string;
};

export interface IAuth {
  authenticate(data: unknown): Promise<string>;
  authenticateRefresh(data: unknown): Promise<string>;
  verifyRefreshToken(token: string): Promise<AuthTokenPayload>;
  save(data: { name: string; email: string; password: string }): Promise<User>;
  findByID(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  activate(email: string): Promise<User>;
  updateEmailPassword(userId: string, encryptedPassword: string): Promise<User>;
  saveResetCode(
    userId: string,
    hashedCode: string,
    expiresAt: Date,
  ): Promise<void>;
  clearResetCode(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  generatePasswordResetToken(userId: string, email: string): Promise<string>;
  verifyPasswordResetToken(token: string): Promise<PasswordResetTokenPayload>;
  generateEmailConfirmationToken(email: string): Promise<string>;
  verifyEmailConfirmationToken(
    token: string,
  ): Promise<EmailConfirmationTokenPayload>;
}
