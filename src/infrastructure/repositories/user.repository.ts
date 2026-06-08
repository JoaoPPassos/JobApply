import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@domain/entities/User.entity';
import { NotFoundException } from '@shared/exceptions/exceptions';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByID(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateEmailPassword(
    userId: string,
    encryptedPassword: string,
  ): Promise<User> {
    const user = await this.findByID(userId);
    user.email_password = encryptedPassword;
    return this.userRepository.save(user);
  }
}
