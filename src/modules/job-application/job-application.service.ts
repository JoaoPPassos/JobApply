import { Injectable } from '@nestjs/common';
import { JobApplication } from './interfaces/JobApplication.interface';
import { CreateJobApplicationDTO } from './dto/create-job-application';
import { UpdateJobApplicationDTO } from './dto/update-job-application';
import { CreateJobApplicationUseCase } from '@domain/use-cases/job-application/create-job-application.use-case';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { JobProcessorService } from '@infrastructure/services/job-processor.service';

@Injectable()
export class JobApplicationService {
  constructor(
    private readonly createJobApplicationUseCase: CreateJobApplicationUseCase,
    private readonly applicationRepository: ApplicationRepository,
    private readonly jobRepository: JobRepository,
    private readonly jobProcessor: JobProcessorService,
  ) {}

  async findAll(): Promise<JobApplication[]> {
    return await this.applicationRepository.findAll();
  }

  async findById(id: string): Promise<JobApplication> {
    return await this.applicationRepository.findById(id);
  }

  async create(data: CreateJobApplicationDTO): Promise<JobApplication> {
    const application = await this.createJobApplicationUseCase.execute(data);

    void this.enrichJobMetadata(
      application.job.id,
      data.job_source_url,
      data.source_platform,
    );

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

  async remove(id: string): Promise<JobApplication[]> {
    return await this.applicationRepository.remove(id);
  }

  private async enrichJobMetadata(
    jobId: string,
    source_url: string,
    source_platform: string,
  ): Promise<void> {
    try {
      const metadata = await this.jobProcessor.process(
        source_url,
        source_platform,
      );

      await this.jobRepository.update({
        id: jobId,
        ...metadata,
        source_url,
        source_platform,
        metadata_status: 'complete',
      });
    } catch (error) {
      console.error('Job metadata enrichment failed', error);
    }
  }
}
