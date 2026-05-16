import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@domain/use-cases/auth/create-user.use-case';
import { LoginUserUseCase } from '@domain/use-cases/auth/login-user.use-case';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';
import { AuthLogin } from '@module/auth/types/AuthLogin.type';
import { User } from '@domain/entities/User.entity';
import { SendMailUseCase } from '@domain/use-cases/mail/send-email.use-case';
import { MailRepository } from '@infrastructure/repositories/mail.repository';
import { WorkerRepository } from '@infrastructure/repositories/worker.repository';
import { ActiveUserUseCase } from '@domain/use-cases/auth/active-user.use-case';
import { RefreshTokenUseCase } from '@domain/use-cases/auth/refresh-token.use-case';
import { AuthTokens } from '@module/auth/types/AuthLogin.type';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private hashRepository: HashRepository,
    private emailRepository: MailRepository,
    private workerRepository: WorkerRepository,
  ) {}

  async signUp(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const createUserUseCase = new CreateUserUseCase(
      this.authRepository,
      this.hashRepository,
    );
    const sendEmailUserCase = new SendMailUseCase(this.emailRepository);
    const user = await createUserUseCase.execute(data);
    const confirmationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/confirm?email=${encodeURIComponent(user.email)}`;

    await this.workerRepository.addJob('email', {}, async () => {
      await sendEmailUserCase.execute({
        html: this.emailRepository.mapAccountConfirmationTemplate({
          name: user.name,
          confirmationUrl,
          appName: process.env.APP_NAME || 'JobApply',
        }),
        subject: 'Your Account must be activated!',
        to: user.email,
      });
    });

    return user;
  }

  async login(data: { email: string; password: string }): Promise<AuthLogin> {
    const useCase = new LoginUserUseCase(
      this.authRepository,
      this.hashRepository,
    );

    return useCase.execute(data);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const useCase = new RefreshTokenUseCase(this.authRepository);

    return useCase.execute(refreshToken);
  }

  async activate(email: string) {
    const useCase = new ActiveUserUseCase(this.authRepository);

    return useCase.execute(email);
  }
}
