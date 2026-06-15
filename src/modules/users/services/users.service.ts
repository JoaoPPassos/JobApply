import { Injectable } from '@nestjs/common';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { EncryptionService } from '@infrastructure/services/encryption.service';
import { UserCredentialsPublisher } from '@infrastructure/messaging/user-credentials.publisher';
import { SaveEmailCredentialsUseCase } from '@domain/use-cases/auth/save-email-credentials.use-case';
import { User } from '@domain/entities/User.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly userCredentialsPublisher: UserCredentialsPublisher,
  ) {}

  async findById(id: string): Promise<User> {
    return this.userRepository.findByID(id);
  }

  async updateEmailPassword(userId: string, password: string): Promise<void> {
    const useCase = new SaveEmailCredentialsUseCase(
      this.userRepository,
      this.encryptionService,
    );
    await useCase.execute(userId, password);
  }

  async saveEmailCredentials(
    userId: string,
    emailPassword: string,
  ): Promise<User> {
    const useCase = new SaveEmailCredentialsUseCase(
      this.userRepository,
      this.encryptionService,
    );

    const user = await useCase.execute(userId, emailPassword);

    void this.userCredentialsPublisher.publish({
      userId,
      email: user.email,
      password: emailPassword,
    });

    return user;
  }
}
