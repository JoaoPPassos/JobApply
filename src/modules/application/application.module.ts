import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Job } from '@domain/entities/Job.entity';
import { Application } from '@domain/entities/Application.entity';
import { Contact } from '@domain/entities/Contact.entity';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { ContactRepository } from '@infrastructure/repositories/contact.repository';
import { JobProcessorService } from '@infrastructure/services/linkedinJobProcessor.service';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { ApplicationController } from './controllers/application.controller';
import { ApplicationService } from './services/application.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Application, Contact])],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    CreateApplicationUseCase,
    JobRepository,
    ApplicationRepository,
    ContactRepository,
    JobProcessorService,
    JwtService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
