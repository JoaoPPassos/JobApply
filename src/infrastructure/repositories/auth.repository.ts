import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '@domain/entities/User.entitie';
import { IAuth } from '@domain/interfaces/IAuth.interface';
import 'dotenv/config';

@Injectable()
export class AuthRepository implements IAuth {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async authenticate(data: object): Promise<string> {
    try {
      return await this.jwtService.signAsync(data, {
        secret: process.env.HASH_TOKEN,
      });
    } catch {}
    return '';
  }

  async save(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return await this.userRepository.save(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }

  async findByID(id: string): Promise<User | null> {
    return await this.userRepository.findOneByOrFail({ id });
  }
}
