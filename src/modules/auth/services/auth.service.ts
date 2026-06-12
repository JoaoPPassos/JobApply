import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@domain/use-cases/auth/create-user.use-case';
import { LoginUserUseCase } from '@domain/use-cases/auth/login-user.use-case';
import { ForgotPasswordUseCase } from '@domain/use-cases/auth/forgot-password.use-case';
import { ValidateResetCodeUseCase } from '@domain/use-cases/auth/validate-reset-code.use-case';
import { ResetPasswordUseCase } from '@domain/use-cases/auth/reset-password.use-case';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';
import { MailRepository } from '@infrastructure/repositories/mail.repository';
import { EmailPublisher } from '@infrastructure/messaging/email.publisher';
import { ActiveUserUseCase } from '@domain/use-cases/auth/active-user.use-case';
import { RefreshTokenUseCase } from '@domain/use-cases/auth/refresh-token.use-case';
import { AuthLogin, AuthTokens } from '@module/auth/types/AuthLogin.type';
import { User } from '@domain/entities/User.entity';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private hashRepository: HashRepository,
    private emailRepository: MailRepository,
    private emailPublisher: EmailPublisher,
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
    const user = await createUserUseCase.execute(data);
    const confirmationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/confirm?email=${encodeURIComponent(user.email)}`;

    await this.emailPublisher.publish({
      to: user.email,
      subject: 'Your Account must be activated!',
      html: this.emailRepository.mapAccountConfirmationTemplate({
        name: user.name,
        confirmationUrl,
        appName: process.env.APP_NAME || 'JobHub',
      }),
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

  async forgotPassword(email: string): Promise<void> {
    const useCase = new ForgotPasswordUseCase(
      this.authRepository,
      this.hashRepository,
    );

    const result = await useCase.execute(email);

    if (!result) return;

    const { user, code } = result;

    await this.emailPublisher.publish({
      to: user.email,
      subject: `Recuperação de senha — ${process.env.APP_NAME || 'JobHub'}`,
      html: this.emailRepository.mapPasswordResetTemplate({
        name: user.name,
        code,
        appName: process.env.APP_NAME || 'JobHub',
      }),
    });
  }

  async verifyResetCode(email: string, code: string): Promise<string> {
    const useCase = new ValidateResetCodeUseCase(
      this.authRepository,
      this.hashRepository,
    );

    return useCase.execute(email, code);
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const useCase = new ResetPasswordUseCase(
      this.authRepository,
      this.hashRepository,
    );

    return useCase.execute(resetToken, newPassword);
  }
}
