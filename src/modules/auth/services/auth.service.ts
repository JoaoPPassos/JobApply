import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@domain/use-cases/auth/create-user.use-case';
import { LoginUserUseCase } from '@domain/use-cases/auth/login-user.use-case';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';
import { IAuthLogin } from '@module/auth/types/AuthLogin.type';
import { User } from '@domain/entities/User.entitie';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private hashRepository: HashRepository,
  ) {}

  async signUp(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const useCase = new CreateUserUseCase(
      this.authRepository,
      this.hashRepository,
    );

    return useCase.execute(data);
  }

  async login(data: { email: string; password: string }): Promise<IAuthLogin> {
    const useCase = new LoginUserUseCase(
      this.authRepository,
      this.hashRepository,
    );

    return useCase.execute(data);
  }
}
