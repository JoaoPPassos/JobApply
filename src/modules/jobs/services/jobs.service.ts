import { Injectable } from '@nestjs/common';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { Job } from '@domain/entities/Job.entity';
import { UpdateJobMetadataDTO } from '../dto/update-job-metadata.dto';

@Injectable()
export class JobsService {
  constructor(private readonly jobRepository: JobRepository) {}

  async updateMetadata(id: string, data: UpdateJobMetadataDTO): Promise<Job> {
    return this.jobRepository.update({
      id,
      ...data,
      metadata_status: 'completed',
    });
  }
}
