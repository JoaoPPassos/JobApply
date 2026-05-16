import type { User } from '@domain/entities/User.entity';

export type AuthTokenPayload = {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
};

export interface IAuth {
  authenticate(data: unknown): Promise<string>;
  authenticateRefresh(data: unknown): Promise<string>;
  verifyRefreshToken(token: string): Promise<AuthTokenPayload>;
  save(data: { name: string; email: string; password: string }): Promise<User>;
  findByID(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  activate(email: string): Promise<User>;
}
