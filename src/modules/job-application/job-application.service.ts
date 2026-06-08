import { Injectable } from '@nestjs/common';
import { JobApplication } from './interfaces/JobApplication.interface';
import { CreateJobApplicationDTO } from './dto/create-job-application';
import { UpdateJobApplicationDTO } from './dto/update-job-application';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { JobEnrichmentPublisher } from '@infrastructure/messaging/job-enrichment.publisher';
import { JobCreatedPublisher } from '@infrastructure/messaging/job-created.publisher';

@Injectable()
export class JobApplicationService {
  constructor(
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobEnrichmentPublisher: JobEnrichmentPublisher,
    private readonly jobCreatedPublisher: JobCreatedPublisher,
  ) {}

  async findAll(): Promise<JobApplication[]> {
    return await this.applicationRepository.findAll();
  }

  async findById(id: string): Promise<JobApplication> {
    return await this.applicationRepository.findById(id);
  }

  async create(data: CreateJobApplicationDTO): Promise<JobApplication> {
    const application = await this.createApplicationUseCase.execute(data);

    void this.jobEnrichmentPublisher.publishEnrichmentRequest({
      jobId: application.job.id,
      sourceUrl: data.job_source_url,
      sourcePlatform: data.source_platform,
    });

    void this.jobCreatedPublisher.publish({
      userId: data.user_id,
      jobId: application.job.id,
      company: data.company,
      role: data.role,
    });

    return application;
  }

  async update(
    id: string,
    data: UpdateJobApplicationDTO,
  ): Promise<JobApplication> {
    const updatePayload: Record<string, unknown> = {};

    if (data.current_status !== undefined) {
      updatePayload.current_status = data.current_status;
    }

    if (data.status !== undefined) {
      updatePayload.current_status = data.status;
    }

    if (data.notes !== undefined) {
      updatePayload.notes = data.notes;
    }

    return await this.applicationRepository.update(id, updatePayload);
  }

  async remove(id: string): Promise<void> {
    await this.applicationRepository.remove(id);
  }
}
