import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { Application } from '@domain/entities/Application.entity';
import { Job } from '@domain/entities/Job.entity';
import { UpdateJobMetadataDTO } from '../dto/update-job-metadata.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobRepository: JobRepository,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async updateMetadata(id: string, data: UpdateJobMetadataDTO): Promise<Job> {
    const { status, ...jobFields } = data;

    if (status) {
      const application = await this.applicationRepository.findOne({
        where: { job: { id } },
      });
      if (application) {
        application.current_status = status;
        await this.applicationRepository.save(application);
      }
    }

    const hasJobFields = Object.values(jobFields).some((v) => v !== undefined);
    if (hasJobFields) {
      return this.jobRepository.update({
        id,
        ...jobFields,
        metadata_status: 'completed',
      });
    }

    return this.jobRepository.findById(id);
  }
}
