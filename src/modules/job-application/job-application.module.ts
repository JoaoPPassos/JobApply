import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { ContactRepository } from '@infrastructure/repositories/contact.repository';
import { Job } from '@domain/entities/Job.entity';
import { Application } from '@domain/entities/Application.entity';
import { Contact } from '@domain/entities/Contact.entity';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Application, Contact]),
    RabbitmqModule,
  ],
  controllers: [JobApplicationController],
  providers: [
    JobApplicationService,
    CreateApplicationUseCase,
    JobRepository,
    ApplicationRepository,
    ContactRepository,
  ],
})
export class JobApplicationModule {}
