import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '@domain/entities/User.entity';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { EncryptionService } from '@infrastructure/services/encryption.service';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RabbitmqModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, EncryptionService, JwtService],
})
export class UsersModule {}
