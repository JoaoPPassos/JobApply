import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';
import { CreateJobApplicationUseCase } from '@domain/use-cases/job-application/create-job-application.use-case';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { ContactRepository } from '@infrastructure/repositories/contact.repository';
import { JobProcessorService } from '@infrastructure/services/job-processor.service';
import { Job } from '@domain/entities/Job.entity';
import { Application } from '@domain/entities/Application.entity';
import { Contact } from '@domain/entities/Contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Application, Contact])],
  controllers: [JobApplicationController],
  providers: [
    JobApplicationService,
    CreateJobApplicationUseCase,
    JobRepository,
    ApplicationRepository,
    ContactRepository,
    JobProcessorService,
  ],
})
export class JobApplicationModule {}
