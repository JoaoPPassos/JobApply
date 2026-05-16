import { User } from '@domain/entities/User.entity';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';

export class ActiveUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string): Promise<User> {
    const response = await this.authRepository.activate(email);

    return response;
  }
}
