import { IAuth } from '@domain/ports/IAuth.interface';
import { IHashService } from '@domain/ports/IHashService.interface';
import { BadRequestException } from '@shared/exceptions/exceptions';

export class ValidateResetCodeUseCase {
  constructor(
    private authRepository: IAuth,
    private hashService: IHashService,
  ) {}

  async execute(email: string, code: string): Promise<string> {
    const user = await this.authRepository.findByEmail(email);

    if (!user || !user.reset_password_code || !user.reset_password_expires_at) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    if (user.reset_password_expires_at < new Date()) {
      throw new BadRequestException('Reset code has expired');
    }

    const isValid = await this.hashService.compare(
      code,
      user.reset_password_code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid reset code');
    }

    return this.authRepository.generatePasswordResetToken(user.id, user.email);
  }
}
