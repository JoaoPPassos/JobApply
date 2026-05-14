import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@domain/entities/User.entitie';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, AuthRepository, HashRepository, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
