import { IAuth } from '@domain/ports/IAuth.interface';
import { IHashService } from '@domain/ports/IHashService.interface';

export class ResetPasswordUseCase {
  constructor(
    private authRepository: IAuth,
    private hashService: IHashService,
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<void> {
    const payload =
      await this.authRepository.verifyPasswordResetToken(resetToken);

    const hashedPassword = await this.hashService.hash(newPassword);

    await this.authRepository.updatePassword(payload.sub, hashedPassword);
    await this.authRepository.clearResetCode(payload.sub);
  }
}
