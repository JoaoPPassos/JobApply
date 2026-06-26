import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@shared/exceptions/exceptions';
import { SuccessResponse } from '@shared/response/success.response';
import { InternalUserGuard } from '@shared/guards/internal-user.guard';
import { ApplicationController } from '../controllers/application.controller';
import { ApplicationService } from '../services/application.service';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';
import { source_type } from '@shared/enums/source.enum';
import { application_status } from '@shared/enums/application.enum';

const mockJob = {
  id: 'job-uuid-123',
  title: 'Pending extraction',
  company: 'Pending extraction',
  source_url: 'https://linkedin.com/jobs/123',
  source_platform: source_type.linkedin,
  metadata_status: 'pending',
};

const mockContact = {
  id: 'contact-uuid-456',
  name: 'John Doe',
  email: 'john.doe@acme.com',
  role: 'Engineering Manager',
};

const mockUserId = 'user-uuid-789';

const mockApplication = {
  id: 'app-uuid-001',
  user_id: mockUserId,
  current_status: application_status.applied,
  applied_at: new Date('2024-01-15'),
  notes: 'Applied through LinkedIn',
  job: mockJob,
  contact: mockContact,
  created_at: new Date(),
  updated_at: new Date(),
};

const validCreateDTO: CreateApplicationDTO = {
  job_source_url: 'https://linkedin.com/jobs/123',
  company: 'Acme',
  role: 'Backend Engineer',
  source_platform: source_type.linkedin,
  current_status: application_status.applied,
  applied_at: new Date('2024-01-15'),
  notes: 'Applied through LinkedIn',
  contact: {
    name: 'John Doe',
    email: 'john.doe@acme.com',
    role: 'Engineering Manager',
  },
};

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let service: jest.Mocked<ApplicationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findByJobId: jest.fn(),
            findByStatus: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(InternalUserGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ApplicationController>(ApplicationController);
    service = module.get(ApplicationService);
  });

  describe('POST /applications', () => {
    it('should create an application and return a SuccessResponse', async () => {
      service.create.mockResolvedValue(mockApplication as any);
      const mockReq = { userId: mockUserId } as any;

      const result = await controller.create(mockReq, validCreateDTO);

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toEqual(mockApplication);
      expect(result.statusCode).toBe(201);
      expect(service.create).toHaveBeenCalledWith(validCreateDTO, mockUserId);
    });
  });

  describe('GET /applications', () => {
    it('should return all applications wrapped in SuccessResponse', async () => {
      service.findAll.mockResolvedValue([mockApplication] as any);

      const result = await controller.findAll();

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toEqual([mockApplication]);
      expect(result.statusCode).toBe(200);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by user_id when provided', async () => {
      service.findByUserId.mockResolvedValue([mockApplication] as any);

      const result = await controller.findAll(mockUserId);

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toEqual([mockApplication]);
      expect(service.findByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('should filter by job_id when provided', async () => {
      service.findByJobId.mockResolvedValue([mockApplication] as any);

      const result = await controller.findAll(undefined, mockJob.id);

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toEqual([mockApplication]);
      expect(service.findByJobId).toHaveBeenCalledWith(mockJob.id);
    });

    it('should filter by status when provided', async () => {
      service.findByStatus.mockResolvedValue([mockApplication] as any);

      const result = await controller.findAll(
        undefined,
        undefined,
        application_status.applied,
      );

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toEqual([mockApplication]);
      expect(service.findByStatus).toHaveBeenCalledWith(application_status.applied);
    });
  });

  describe('GET /applications/:id', () => {
    it('should return application wrapped in SuccessResponse', async () => {
      service.findById.mockResolvedValue(mockApplication as any);

      const result = await controller.findOne(mockApplication.id);

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toEqual(mockApplication);
      expect(result.statusCode).toBe(200);
      expect(service.findById).toHaveBeenCalledWith(mockApplication.id);
    });

    it('should propagate NotFoundException when not found', async () => {
      service.findById.mockRejectedValue(new NotFoundException('not found'));

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /applications/:id', () => {
    it('should update and return a SuccessResponse with updated application', async () => {
      const updateDTO: UpdateApplicationDTO = {
        current_status: application_status.in_review,
      };
      const updated = {
        ...mockApplication,
        current_status: application_status.in_review,
      };
      service.update.mockResolvedValue(updated as any);

      const result = await controller.update(mockApplication.id, updateDTO);

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data.current_status).toBe(application_status.in_review);
      expect(result.statusCode).toBe(200);
      expect(service.update).toHaveBeenCalledWith(mockApplication.id, updateDTO);
    });
  });

  describe('DELETE /applications/:id', () => {
    it('should remove the application and return a SuccessResponse', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockApplication.id);

      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.data).toBeNull();
      expect(result.statusCode).toBe(200);
      expect(service.remove).toHaveBeenCalledWith(mockApplication.id);
    });
  });
});
