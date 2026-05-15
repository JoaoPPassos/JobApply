import type { User } from '@domain/entities/User.entitie';

export type AuthLogin = {
  user: User;
  accessToken: string;
};
