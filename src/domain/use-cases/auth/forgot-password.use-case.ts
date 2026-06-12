import { IAuth } from '@domain/ports/IAuth.interface';
import { IHashService } from '@domain/ports/IHashService.interface';
import { User } from '@domain/entities/User.entity';

export class ForgotPasswordUseCase {
  constructor(
    private authRepository: IAuth,
    private hashService: IHashService,
  ) {}

  async execute(email: string): Promise<{ user: User; code: string } | null> {
    const user = await this.authRepository.findByEmail(email);

    if (!user) return null;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.authRepository.saveResetCode(user.id, hashedCode, expiresAt);

    return { user, code };
  }
}
