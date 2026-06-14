import { User } from '@domain/entities/User.entity';
import { IAuth } from '@domain/ports/IAuth.interface';

export class ActiveUserUseCase {
  constructor(private authRepository: IAuth) {}

  async execute(token: string): Promise<User> {
    const { email } =
      await this.authRepository.verifyEmailConfirmationToken(token);
    return this.authRepository.activate(email);
  }
}
