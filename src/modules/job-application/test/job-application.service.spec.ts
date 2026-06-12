import { NotFoundException } from '@nestjs/common';
import { JobApplicationService } from '../job-application.service';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { JobEnrichmentPublisher } from '@infrastructure/messaging/job-enrichment.publisher';
import { JobCreatedPublisher } from '@infrastructure/messaging/job-created.publisher';
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
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockJobEnrichmentPublisher = {
    publishEnrichmentRequest: jest.fn().mockResolvedValue(undefined),
  };

  const mockJobCreatedPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    service = new JobApplicationService(
      mockCreateUseCase as unknown as CreateApplicationUseCase,
      mockApplicationRepo as unknown as ApplicationRepository,
      mockJobEnrichmentPublisher as unknown as JobEnrichmentPublisher,
      mockJobCreatedPublisher as unknown as JobCreatedPublisher,
    );
  });

  it('should create a new job application and fire enrichment', async () => {
    const payload: CreateJobApplicationDTO = {
      job_source_url: 'https://example.com/jobs/1?title=Backend+Engineer&company=Acme+Inc.',
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
    await expect(service.remove('application-1')).resolves.toBeUndefined();
    expect(mockApplicationRepo.remove).toHaveBeenCalledWith('application-1');
  });

  it('should throw NotFoundException when repository cannot find application', async () => {
    mockApplicationRepo.findById.mockRejectedValueOnce(new NotFoundException());

    await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
  });
});
