import { User } from '@domain/entities/User.entitie';
import { IAuth } from '@domain/ports/IAuth.interface';
import { IHashService } from '@domain/ports/IHashService.interface';

export class CreateUserUseCase {
  constructor(
    private userRepository: IAuth,
    private hashService: IHashService,
  ) {}

  async execute(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const hashedPassword = await this.hashService.hash(data.password);
    const user = { ...data, password: hashedPassword };
    return this.userRepository.save(user);
  }
}
