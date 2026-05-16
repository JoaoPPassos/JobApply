import type { User } from '@domain/entities/User.entitie';

export interface IAuth {
  authenticate(data: unknown): Promise<string>;
  save(data: { name: string; email: string; password: string }): Promise<User>;
  findByID(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  activate(email: string): Promise<User>;
}
