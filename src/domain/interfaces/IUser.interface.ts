import { User } from '@domain/entities/User.entitie';

export interface IUserRepository {
  save(data: { name: string; email: string; password: string }): Promise<User>;
  findByID(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
