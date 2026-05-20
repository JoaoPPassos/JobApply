import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationController } from '../job-application.controller';
import { JobApplicationService } from '../job-application.service';
import type { CreateJobApplicationDTO } from '../dto/create-job-application';
import type { UpdateJobApplicationDTO } from '../dto/update-job-application';
import type { JobApplication } from '../interfaces/JobApplication.interface';

const mockApplication: JobApplication = {
  id: 'application-1',
  current_status: 'applied',
  applied_at: new Date('2026-01-01'),
  notes: 'Initial application',
  user: { id: 'user-1' },
  job: {
    id: 'job-1',
    title: 'Backend Engineer',
    company: 'Acme Inc.',
    description: 'A backend role.',
    salary_range: '80k-100k',
    source_url: 'https://example.com/job/1',
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

describe('JobApplicationController', () => {
  let controller: JobApplicationController;
  let service: JobApplicationService;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockApplication]),
    findById: jest.fn().mockResolvedValue(mockApplication),
    create: jest.fn().mockResolvedValue(mockApplication),
    update: jest.fn().mockResolvedValue({
      ...mockApplication,
      current_status: 'screening',
    }),
    remove: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationController],
      providers: [
        {
          provide: JobApplicationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<JobApplicationController>(JobApplicationController);
    service = module.get<JobApplicationService>(JobApplicationService);
  });

  it('should return all job applications', async () => {
    const result = await controller.findAll();

    expect(result).toEqual([mockApplication]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single application by id', async () => {
    const result = await controller.findById('application-1');

    expect(result).toEqual(mockApplication);
    expect(service.findById).toHaveBeenCalledWith('application-1');
  });

  it('should create a job application with source data', async () => {
    const payload: CreateJobApplicationDTO = {
      job_source_url: 'https://example.com/job/1?title=Backend+Engineer&company=Acme',
      source_platform: 'LinkedIn',
      user_id: 'user-1',
      current_status: 'applied',
      applied_at: new Date('2026-01-01'),
      notes: 'Applied from a referral.',
      contact: {
        name: 'Jane Doe',
        email: 'jane.doe@acme.com',
        role: 'Recruiter',
      },
    };

    const result = await controller.create(payload);

    expect(result).toEqual(mockApplication);
    expect(service.create).toHaveBeenCalledWith(payload);
  });

  it('should update a job application status', async () => {
    const updatePayload: UpdateJobApplicationDTO = {
      status: 'screening',
    };

    const result = await controller.update('application-1', updatePayload);

    expect(result.current_status).toBe('screening');
    expect(service.update).toHaveBeenCalledWith('application-1', updatePayload);
  });

  it('should delete a job application', async () => {
    const result = await controller.delete('application-1');

    expect(result).toEqual([]);
    expect(service.remove).toHaveBeenCalledWith('application-1');
  });
});

