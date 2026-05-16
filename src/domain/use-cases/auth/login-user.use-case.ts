import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthTokenPayload, IAuth } from '@domain/ports/IAuth.interface';
import { IHashService } from '@domain/ports/IHashService.interface';
import { AuthLogin } from '@module/auth/types/AuthLogin.type';

export class LoginUserUseCase {
  constructor(
    private authRepository: IAuth,
    private hashService: IHashService,
  ) {}
  async execute(data: { email: string; password: string }): Promise<AuthLogin> {
    const user = await this.authRepository.findByEmail(data.email);

    if (user === null) throw new NotFoundException('Usuário não encontrado');

    if (!user.password)
      throw new BadRequestException('Email ou password errados.');

    const valid = await this.hashService.compare(data.password, user.password);

    if (!valid) throw new BadRequestException('Email ou password errados.');

    const tokenPayload: AuthTokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
    };
    const accessToken = await this.authRepository.authenticate(tokenPayload);
    const refreshToken =
      await this.authRepository.authenticateRefresh(tokenPayload);
    const safeUser: AuthLogin['user'] = {
      id: user.id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      name: user.name,
      email: user.email,
      is_active: user.is_active,
    };

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }
}
