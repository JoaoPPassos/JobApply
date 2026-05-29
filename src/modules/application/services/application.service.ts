import { Injectable, Logger } from '@nestjs/common';
import { Application } from '@domain/entities/Application.entity';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { JobProcessorService } from '@infrastructure/services/linkedinJobProcessor.service';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobRepository: JobRepository,
    private readonly jobProcessorService: JobProcessorService,
  ) {}

  async create(data: CreateApplicationDTO): Promise<Application> {
    const application = await this.createApplicationUseCase.execute(data);
    void this.enrichJobMetadata(
      application.job.id,
      data.job_source_url,
      data.source_platform,
    );
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

  private async enrichJobMetadata(
    jobId: string,
    sourceUrl: string,
    sourcePlatform: string,
  ): Promise<void> {
    try {
      const metadata = await this.jobProcessorService.process(
        sourceUrl,
        sourcePlatform,
      );
      await this.jobRepository.update({
        id: jobId,
        ...metadata,
        metadata_status: 'completed',
      });
    } catch (error) {
      this.logger.error(
        `Failed to enrich job metadata for job ${jobId}`,
        error,
      );
      await this.jobRepository.update({ id: jobId, metadata_status: 'failed' });
    }
  }
}
