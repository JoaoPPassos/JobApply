import type { User } from '@domain/entities/User.entity';

export type AuthUser = Omit<User, 'password' | 'email_password'>;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthLogin = {
  user: Omit<AuthUser, 'applications'>;
} & AuthTokens;
