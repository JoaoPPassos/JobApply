import { NotFoundException } from '@domain/errors/exceptions';
import { IAuth } from '@domain/ports/IAuth.interface';
import { IHashService } from '@domain/ports/IHashService.interface';
import { BadRequestException } from '@shared/exceptions/exceptions';
import { IAuthLogin } from '@module/auth/types/AuthLogin.type';

export class LoginUserUseCase {
  constructor(
    private authRepository: IAuth,
    private hashService: IHashService,
  ) {}
  async execute(data: {
    email: string;
    password: string;
  }): Promise<IAuthLogin> {
    const user = await this.authRepository.findByEmail(data.email);

    if (user === null) throw new NotFoundException('Usuário não encontrado');

    if (!user.password)
      throw new BadRequestException('Email ou password errados.');

    const valid = await this.hashService.compare(data.password, user.password);

    if (!valid) throw new BadRequestException('Email ou password errados.');

    const token = await this.authRepository.authenticate({ ...user });

    return {
      user,
      accessToken: token,
    };
  }
}
