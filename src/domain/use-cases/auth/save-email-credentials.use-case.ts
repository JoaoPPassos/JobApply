import { User } from '@domain/entities/User.entity';
import { IEncryptionService } from '@domain/ports/IEncryptionService.interface';

interface IEmailPasswordRepository {
  updateEmailPassword(userId: string, encryptedPassword: string): Promise<User>;
}

export class SaveEmailCredentialsUseCase {
  constructor(
    private repository: IEmailPasswordRepository,
    private encryptionService: IEncryptionService,
  ) {}

  async execute(userId: string, emailPassword: string): Promise<User> {
    const encrypted = this.encryptionService.encrypt(emailPassword);
    return this.repository.updateEmailPassword(userId, encrypted);
  }
}
