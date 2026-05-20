import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@shared/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '@domain/entities/Job.entity';
import {
  IJob,
  saveJob,
  updateJob,
  findByParams,
} from '@domain/ports/IJob.Interface';

@Injectable()
export class JobRepository implements IJob {
  constructor(@InjectRepository(Job) private jobRepository: Repository<Job>) {}

  async save(data: saveJob): Promise<Job> {
    return await this.jobRepository.save(data);
  }

  async update(data: updateJob): Promise<Job> {
    if (!data.id) {
      throw new BadRequestException('Job id is required to update job data');
    }

    const existingJob = await this.jobRepository.findOneBy({ id: data.id });
    if (!existingJob) {
      throw new NotFoundException(`Job with id ${data.id} not found`);
    }

    return await this.jobRepository.save({ ...existingJob, ...data });
  }

  async delete(id: string): Promise<Job> {
    const job = await this.jobRepository.findOneBy({ id });
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    await this.jobRepository.remove(job);
    return job;
  }

  async findById(id: string): Promise<Job> {
    const job = await this.jobRepository.findOneBy({ id });
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    return job;
  }

  async findBy(params: findByParams): Promise<Job | null> {
    return await this.jobRepository.findOneBy(params);
  }
}
