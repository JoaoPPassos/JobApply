import { Injectable } from '@nestjs/common';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { ContactRepository } from '@infrastructure/repositories/contact.repository';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { Application } from '@domain/entities/Application.entity';
import { User } from '@domain/entities/User.entity';

export type CreateApplicationInput = {
  job_source_url: string;
  company: string;
  role: string;
  source_platform: string;
  user_id: string;
  current_status: string;
  applied_at: Date;
  notes?: string;
  contact: {
    name: string;
    email: string;
    role: string;
  };
};

@Injectable()
export class CreateApplicationUseCase {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly contactRepository: ContactRepository,
    private readonly applicationRepository: ApplicationRepository,
  ) {}

  async execute(data: CreateApplicationInput): Promise<Application> {
    const job = await this.jobRepository.save({
      title: data.role,
      company: data.company,
      description: 'Job details will be loaded from the source URL.',
      salary_range: 'TBD',
      source_url: data.job_source_url,
      source_platform: data.source_platform,
      location: 'Pending location',
      metadata_status: 'pending',
    });

    const contact = await this.contactRepository.save(data.contact);

    return this.applicationRepository.save({
      current_status: data.current_status,
      applied_at: data.applied_at,
      notes: data.notes,
      user: { id: data.user_id } as User,
      job,
      contact,
    });
  }
}
