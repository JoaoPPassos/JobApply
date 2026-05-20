import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@shared/exceptions/exceptions';
import { ApplicationService } from '../services/application.service';
import { CreateApplicationUseCase } from '@domain/use-cases/application/create-application.use-case';
import { ApplicationRepository } from '@infrastructure/repositories/application.repository';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { JobProcessorService } from '@infrastructure/services/job-processor.service';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';

const mockJob = {
  id: 'job-uuid-123',
  title: 'Pending extraction',
  company: 'Pending extraction',
  source_url: 'https://linkedin.com/jobs/123',
  source_platform: 'LinkedIn',
  metadata_status: 'pending',
};

const mockContact = {
  id: 'contact-uuid-456',
  name: 'John Doe',
  email: 'john.doe@acme.com',
  role: 'Engineering Manager',
};

const mockUser = { id: 'user-uuid-789' };

const mockApplication = {
  id: 'app-uuid-001',
  current_status: 'applied',
  applied_at: new Date('2024-01-15'),
  notes: 'Applied through LinkedIn',
  job: mockJob,
  contact: mockContact,
  user: mockUser,
  created_at: new Date(),
  updated_at: new Date(),
};

const validCreateDTO: CreateApplicationDTO = {
  job_source_url: 'https://linkedin.com/jobs/123',
  source_platform: 'LinkedIn',
  user_id: mockUser.id,
  current_status: 'applied',
  applied_at: new Date('2024-01-15'),
  notes: 'Applied through LinkedIn',
  contact: { name: 'John Doe', email: 'john.doe@acme.com', role: 'Engineering Manager' },
};

describe('ApplicationService', () => {
  let service: ApplicationService;
  let createApplicationUseCase: jest.Mocked<CreateApplicationUseCase>;
  let applicationRepository: jest.Mocked<ApplicationRepository>;
  let jobRepository: jest.Mocked<JobRepository>;
  let jobProcessorService: jest.Mocked<JobProcessorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: CreateApplicationUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ApplicationRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findByJobId: jest.fn(),
            findByStatus: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JobRepository,
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: JobProcessorService,
          useValue: {
            process: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    createApplicationUseCase = module.get(CreateApplicationUseCase);
    applicationRepository = module.get(ApplicationRepository);
    jobRepository = module.get(JobRepository);
    jobProcessorService = module.get(JobProcessorService);
  });

  describe('create', () => {
    it('should create an application and return it immediately', async () => {
      createApplicationUseCase.execute.mockResolvedValue(mockApplication as any);
      jobProcessorService.process.mockResolvedValue({
        title: 'Backend Engineer',
        company: 'Acme',
        description: 'desc',
        salary_range: '$100k',
        location: 'Remote',
      });
      jobRepository.update.mockResolvedValue(undefined as any);

      const result = await service.create(validCreateDTO);

      expect(result).toEqual(mockApplication);
      expect(createApplicationUseCase.execute).toHaveBeenCalledWith(validCreateDTO);
    });

    it('should fire-and-forget enrichment without blocking response', async () => {
      createApplicationUseCase.execute.mockResolvedValue(mockApplication as any);
      jobProcessorService.process.mockResolvedValue({
        title: 'Backend Engineer',
        company: 'Acme',
        description: 'desc',
        salary_range: '$100k',
        location: 'Remote',
      });
      jobRepository.update.mockResolvedValue(undefined as any);

      const result = await service.create(validCreateDTO);

      expect(result.id).toBe(mockApplication.id);
    });

    it('should not throw if enrichment fails internally', async () => {
      createApplicationUseCase.execute.mockResolvedValue(mockApplication as any);
      jobProcessorService.process.mockRejectedValue(new Error('Scraper failed'));
      jobRepository.update.mockResolvedValue(undefined as any);

      await expect(service.create(validCreateDTO)).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all applications', async () => {
      applicationRepository.findAll.mockResolvedValue([mockApplication] as any);

      const result = await service.findAll();

      expect(result).toEqual([mockApplication]);
      expect(applicationRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return application by id', async () => {
      applicationRepository.findById.mockResolvedValue(mockApplication as any);

      const result = await service.findById(mockApplication.id);

      expect(result).toEqual(mockApplication);
      expect(applicationRepository.findById).toHaveBeenCalledWith(mockApplication.id);
    });

    it('should propagate NotFoundException when not found', async () => {
      applicationRepository.findById.mockRejectedValue(
        new NotFoundException('Application with id not-found not found'),
      );

      await expect(service.findById('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return applications filtered by user id', async () => {
      applicationRepository.findByUserId.mockResolvedValue([mockApplication] as any);

      const result = await service.findByUserId(mockUser.id);

      expect(result).toEqual([mockApplication]);
      expect(applicationRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findByJobId', () => {
    it('should return applications filtered by job id', async () => {
      applicationRepository.findByJobId.mockResolvedValue([mockApplication] as any);

      const result = await service.findByJobId(mockJob.id);

      expect(result).toEqual([mockApplication]);
    });
  });

  describe('findByStatus', () => {
    it('should return applications filtered by status', async () => {
      applicationRepository.findByStatus.mockResolvedValue([mockApplication] as any);

      const result = await service.findByStatus('applied');

      expect(result).toEqual([mockApplication]);
    });
  });

  describe('update', () => {
    it('should update an application', async () => {
      const updateDTO: UpdateApplicationDTO = { current_status: 'interviewing', notes: 'Got a callback' };
      const updated = { ...mockApplication, ...updateDTO };
      applicationRepository.update.mockResolvedValue(updated as any);

      const result = await service.update(mockApplication.id, updateDTO);

      expect(result.current_status).toBe('interviewing');
      expect(applicationRepository.update).toHaveBeenCalledWith(mockApplication.id, updateDTO);
    });
  });

  describe('remove', () => {
    it('should remove an application', async () => {
      applicationRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove(mockApplication.id)).resolves.toBeUndefined();
      expect(applicationRepository.remove).toHaveBeenCalledWith(mockApplication.id);
    });
  });
});
