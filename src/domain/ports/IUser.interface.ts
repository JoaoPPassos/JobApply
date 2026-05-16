import type { User } from '@domain/entities/User.entity';

export interface IUserRepository {
  save(data: { name: string; email: string; password: string }): Promise<User>;
  findByID(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}
