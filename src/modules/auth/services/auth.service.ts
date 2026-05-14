import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@domain/use-cases/auth/create-user.use-case';
import { LoginUserUseCase } from '@domain/use-cases/auth/login-user.use-case';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private hashRepository: HashRepository,
  ) {}

  async signUp(data: { name: string; email: string; password: string }) {
    const useCase = new CreateUserUseCase(
      this.authRepository,
      this.hashRepository,
    );

    return useCase.execute(data);
  }

  async login(data: { email: string; password: string }) {
    const useCase = new LoginUserUseCase(
      this.authRepository,
      this.hashRepository,
    );

    return useCase.execute(data);
  }
}
