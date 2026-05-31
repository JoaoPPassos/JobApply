import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@shared/exceptions/exceptions';
import { SuccessResponse } from '@shared/response/success.response';
import { JobsController } from '../controllers/jobs.controller';
import { JobsService } from '../services/jobs.service';
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
  metadata_status: 'completed',
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

describe('JobsController', () => {
  let controller: JobsController;
  let service: jest.Mocked<JobsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: {
            updateMetadata: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    service = module.get(JobsService);
  });

  describe('PATCH /jobs/:id/metadata', () => {
    it('should update metadata and return a SuccessResponse', async () => {
      service.updateMetadata.mockResolvedValue(mockJob as any);

      const result = await controller.updateMetadata(mockJob.id, validMetadataDTO);

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toEqual(mockJob);
      expect(result.statusCode).toBe(200);
      expect(service.updateMetadata).toHaveBeenCalledWith(mockJob.id, validMetadataDTO);
    });

    it('should propagate NotFoundException when job does not exist', async () => {
      service.updateMetadata.mockRejectedValue(
        new NotFoundException('Job with id not-found not found'),
      );

      await expect(controller.updateMetadata('not-found', validMetadataDTO)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
