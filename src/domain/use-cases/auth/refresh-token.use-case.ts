import { UnauthorizedException } from '@nestjs/common';
import { IAuth } from '@domain/ports/IAuth.interface';
import { AuthTokens } from '@module/auth/types/AuthLogin.type';

export class RefreshTokenUseCase {
  constructor(private authRepository: IAuth) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.authRepository.verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findByID(payload.id);

    if (user.email !== payload.email) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
    };

    const accessToken = await this.authRepository.authenticate(tokenPayload);
    const nextRefreshToken =
      await this.authRepository.authenticateRefresh(tokenPayload);

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  }
}
