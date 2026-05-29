import { NotFoundException } from '@nestjs/common';
import { JobApplicationService } from '../job-application.service';
import { CreateJobApplicationUseCase } from '@domain/use-cases/job-application/create-job-application.use-case';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { JobProcessorService } from '@infrastructure/services/linkedinJobProcessor.service';
import type { JobApplication } from '../interfaces/JobApplication.interface';
import type { CreateJobApplicationDTO } from '../dto/create-job-application';
import type { UpdateJobApplicationDTO } from '../dto/update-job-application';

const mockApplication: JobApplication = {
  id: 'application-1',
  current_status: 'applied',
  applied_at: new Date('2026-05-19'),
  notes: 'Applied from a job board',
  user: { id: 'user-1' },
  job: {
    id: 'job-1',
    title: 'Backend Engineer',
    company: 'Acme Inc.',
    description: 'A backend engineer position.',
    salary_range: '80k-100k',
    source_url: 'https://example.com/jobs/1',
    source_platform: 'LinkedIn',
    location: 'Remote',
    metadata_status: 'pending',
  },
  contact: {
    id: 'contact-1',
    name: 'Jane Doe',
    email: 'jane.doe@acme.com',
    role: 'Recruiter',
  },
};

describe('JobApplicationService', () => {
  let service: JobApplicationService;

  const mockCreateUseCase = {
    execute: jest.fn().mockResolvedValue(mockApplication),
  };

  const mockApplicationRepo = {
    findAll: jest.fn().mockResolvedValue([mockApplication]),
    findById: jest.fn().mockResolvedValue(mockApplication),
    update: jest.fn().mockResolvedValue({
      ...mockApplication,
      current_status: 'screening',
    }),
    remove: jest.fn().mockResolvedValue([]),
  };

  const mockJobRepo = {
    update: jest.fn().mockResolvedValue({
      ...mockApplication.job,
      metadata_status: 'complete',
    }),
  };

  const mockJobProcessor = {
    process: jest.fn().mockResolvedValue({
      title: 'Backend Engineer',
      company: 'Acme Inc.',
      description: 'A backend engineer position.',
      salary_range: '80k-100k',
      location: 'Remote',
    }),
  };

  beforeEach(() => {
    service = new JobApplicationService(
      mockCreateUseCase as unknown as CreateJobApplicationUseCase,
      mockApplicationRepo as unknown as ApplicationRepository,
      mockJobRepo as unknown as JobRepository,
      mockJobProcessor as unknown as JobProcessorService,
    );
  });

  it('should create a new job application and schedule metadata enrichment', async () => {
    const payload: CreateJobApplicationDTO = {
      job_source_url:
        'https://example.com/jobs/1?title=Backend+Engineer&company=Acme+Inc.',
      source_platform: 'LinkedIn',
      user_id: 'user-1',
      current_status: 'applied',
      applied_at: new Date('2026-05-19'),
      notes: 'Applied from a referral.',
      contact: {
        name: 'Jane Doe',
        email: 'jane.doe@acme.com',
        role: 'Recruiter',
      },
    };

    const result = await service.create(payload);

    expect(result).toEqual(mockApplication);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(payload);

    await Promise.resolve();
    expect(mockJobProcessor.process).toHaveBeenCalledWith(
      payload.job_source_url,
      payload.source_platform,
    );
    expect(mockJobRepo.update).toHaveBeenCalledWith({
      id: mockApplication.job.id,
      title: 'Backend Engineer',
      company: 'Acme Inc.',
      description: 'A backend engineer position.',
      salary_range: '80k-100k',
      location: 'Remote',
      source_url: payload.job_source_url,
      source_platform: payload.source_platform,
      metadata_status: 'complete',
    });
  });

  it('should return all applications from the repository', async () => {
    const result = await service.findAll();

    expect(result).toEqual([mockApplication]);
    expect(mockApplicationRepo.findAll).toHaveBeenCalled();
  });

  it('should return an application by id', async () => {
    const result = await service.findById('application-1');

    expect(result).toEqual(mockApplication);
    expect(mockApplicationRepo.findById).toHaveBeenCalledWith('application-1');
  });

  it('should update a job application with mapped status fields', async () => {
    const payload: UpdateJobApplicationDTO = { status: 'screening' };

    const result = await service.update('application-1', payload);

    expect(result.current_status).toBe('screening');
    expect(mockApplicationRepo.update).toHaveBeenCalledWith('application-1', {
      current_status: 'screening',
    });
  });

  it('should remove an existing application', async () => {
    const result = await service.remove('application-1');

    expect(result).toEqual([]);
    expect(mockApplicationRepo.remove).toHaveBeenCalledWith('application-1');
  });

  it('should throw NotFoundException when repository cannot find application', async () => {
    mockApplicationRepo.findById.mockRejectedValueOnce(new NotFoundException());

    await expect(service.findById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
