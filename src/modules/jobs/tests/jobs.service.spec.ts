import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@shared/exceptions/exceptions';
import { JobsService } from '../services/jobs.service';
import { JobRepository } from '@infrastructure/repositories/job.repository';
import { Application } from '@domain/entities/Application.entity';
import { UpdateJobMetadataDTO } from '../dto/update-job-metadata.dto';

const mockJob = {
  id: 'job-uuid-123',
  title: 'Backend Engineer',
  company: 'Acme Corp',
  description: 'Build scalable APIs',
  salary_range: '$120k',
  location: 'Remote',
  source_url: 'https://linkedin.com/jobs/123',
  source_platform: 'LinkedIn',
  metadata_status: 'pending',
  created_at: new Date(),
  updated_at: new Date(),
};

const validMetadataDTO: UpdateJobMetadataDTO = {
  title: 'Backend Engineer',
  company: 'Acme Corp',
  description: 'Build scalable APIs',
  salary_range: '$120k',
  location: 'Remote',
};

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: jest.Mocked<JobRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: JobRepository,
          useValue: {
            update: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Application),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get(JobRepository);
  });

  describe('updateMetadata', () => {
    it('should update job metadata and set status to completed', async () => {
      const updated = { ...mockJob, ...validMetadataDTO, metadata_status: 'completed' };
      jobRepository.update.mockResolvedValue(updated as any);

      const result = await service.updateMetadata(mockJob.id, validMetadataDTO);

      expect(result.metadata_status).toBe('completed');
      expect(result.title).toBe(validMetadataDTO.title);
      expect(jobRepository.update).toHaveBeenCalledWith({
        id: mockJob.id,
        ...validMetadataDTO,
        metadata_status: 'completed',
      });
    });

    it('should propagate NotFoundException when job does not exist', async () => {
      jobRepository.update.mockRejectedValue(
        new NotFoundException('Job with id not-found not found'),
      );

      await expect(service.updateMetadata('not-found', validMetadataDTO)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
