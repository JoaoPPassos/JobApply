import { Injectable } from '@nestjs/common';
import { Application } from '@domain/entities/Application.entity';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { JobEnrichmentPublisher } from '@infrastructure/messaging/job-enrichment.publisher';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobEnrichmentPublisher: JobEnrichmentPublisher,
  ) {}

  async create(data: CreateApplicationDTO): Promise<Application> {
    const application = await this.createApplicationUseCase.execute(data);
    void this.jobEnrichmentPublisher.publishEnrichmentRequest({
      jobId: application.job.id,
      sourceUrl: data.job_source_url,
      sourcePlatform: data.source_platform,
    });
    return application;
  }

  async findAll(): Promise<Application[]> {
    return this.applicationRepository.findAll();
  }

  async findById(id: string): Promise<Application> {
    return this.applicationRepository.findById(id);
  }

  async findByUserId(userId: string): Promise<Application[]> {
    return this.applicationRepository.findByUserId(userId);
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    return this.applicationRepository.findByJobId(jobId);
  }

  async findByStatus(status: string): Promise<Application[]> {
    return this.applicationRepository.findByStatus(status);
  }

  async update(id: string, data: UpdateApplicationDTO): Promise<Application> {
    return this.applicationRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.applicationRepository.remove(id);
  }
}
