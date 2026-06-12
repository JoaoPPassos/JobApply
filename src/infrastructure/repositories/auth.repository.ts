import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  UnauthorizedException,
} from '@shared/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { User } from '@domain/entities/User.entity';
import {
  AuthTokenPayload,
  IAuth,
  PasswordResetTokenPayload,
} from '@domain/ports/IAuth.interface';
import 'dotenv/config';

@Injectable()
export class AuthRepository implements IAuth {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private getRefreshSecret(): string {
    return process.env.HASH_REFRESH_TOKEN || process.env.HASH_TOKEN || '';
  }

  async authenticate(data: object): Promise<string> {
    try {
      const expiresJWTAccess =
        (process.env.EXPIRES_ACCESS_TOKEN as JwtSignOptions['expiresIn']) ||
        '1d';

      return await this.jwtService.signAsync(data, {
        secret: process.env.HASH_TOKEN,
        expiresIn: expiresJWTAccess,
      });
    } catch (error) {
      console.error(error);
    }
    return '';
  }

  async authenticateRefresh(data: object): Promise<string> {
    try {
      const expiresJWTRefresh =
        (process.env.EXPIRES_REFRESH_TOKEN as JwtSignOptions['expiresIn']) ||
        '7d';

      return await this.jwtService.signAsync(data, {
        secret: this.getRefreshSecret(),
        expiresIn: expiresJWTRefresh,
      });
    } catch (error) {
      console.error(error);
    }

    return '';
  }

  async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, { secret: this.getRefreshSecret() });

      if (!payload || typeof payload !== 'object') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const value = payload;

      if (
        typeof value.id !== 'string' ||
        typeof value.email !== 'string' ||
        typeof value.name !== 'string' ||
        typeof value.is_active !== 'boolean'
      ) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      return {
        id: value.id,
        email: value.email,
        name: value.name,
        is_active: value.is_active,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async save(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return await this.userRepository.save(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });

    return user;
  }

  async findByID(id: string): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ id });

    return user;
  }

  async activate(email: string): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ email });

    if (user.is_active) throw new BadRequestException();
    user.is_active = true;

    await this.userRepository.save(user);

    return user;
  }

  async updateEmailPassword(
    userId: string,
    encryptedPassword: string,
  ): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    user.email_password = encryptedPassword;
    return this.userRepository.save(user);
  }

  async saveResetCode(
    userId: string,
    hashedCode: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      reset_password_code: hashedCode,
      reset_password_expires_at: expiresAt,
    });
  }

  async clearResetCode(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      reset_password_code: null,
      reset_password_expires_at: null,
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async generatePasswordResetToken(
    userId: string,
    email: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email, type: 'password_reset' },
      { secret: process.env.HASH_TOKEN, expiresIn: '15m' },
    );
  }

  async verifyPasswordResetToken(
    token: string,
  ): Promise<PasswordResetTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, { secret: process.env.HASH_TOKEN });

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        payload.type !== 'password_reset'
      ) {
        throw new UnauthorizedException('Invalid reset token');
      }

      return { sub: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
