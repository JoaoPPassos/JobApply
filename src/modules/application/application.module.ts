import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Job } from '@domain/entities/Job.entity';
import { Application } from '@domain/entities/Application.entity';
import { Contact } from '@domain/entities/Contact.entity';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { ContactRepository } from '@infrastructure/repositories/contact.repository';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { ApplicationController } from './controllers/application.controller';
import { ApplicationService } from './services/application.service';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';
import { UserCacheService } from '@shared/cache/user-request.cache';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Application, Contact]),
    RabbitmqModule,
  ],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    CreateApplicationUseCase,
    JobRepository,
    ApplicationRepository,
    ContactRepository,
    JwtService,
    UserCacheService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
