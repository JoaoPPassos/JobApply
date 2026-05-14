import { Console } from 'console';
import { NotFoundException } from '@domain/errors/exceptions';
import { IAuth } from '@domain/interfaces/IAuth.interface';
import { IHashService } from '@domain/interfaces/IHashService.interface';
import { BadRequestException } from '@shared/exceptions/exceptions';

export class LoginUserUseCase {
  constructor(
    private authRepository: IAuth,
    private hashService: IHashService,
  ) {}
  async execute(data: { email: string; password: string }): Promise<string> {
    const user = await this.authRepository.findByEmail(data.email);

    if (user === null) throw new NotFoundException('Usuário não encontrado');

    const valid = await this.hashService.compare(data.password, user.password);

    if (!valid) throw new BadRequestException('Email ou password errados.');

    const token = await this.authRepository.authenticate({ ...user });

    return token;
  }
}
