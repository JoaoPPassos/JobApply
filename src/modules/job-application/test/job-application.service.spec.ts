import { NotFoundException } from '@nestjs/common';
import { JobApplicationService } from '../job-application.service';

describe('JobApplicationService', () => {
  let service: JobApplicationService;

  const createPayload = {
    position: 'Backend Engineer',
    company: 'Acme Inc.',
    status: 'applied',
  };

  beforeEach(() => {
    service = new JobApplicationService();
  });

  it('should create a job application', () => {
    const created = service.create(createPayload);

    expect(created).toEqual(
      expect.objectContaining({
        id: expect.anything(),
        ...createPayload,
      }),
    );
  });

  it('should list all job applications', () => {
    service.create(createPayload);

    const applications = service.findAll();

    expect(applications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...createPayload,
        }),
      ]),
    );
  });

  it('should find one job application by id', () => {
    const created = service.create(createPayload);

    const found = service.findById(created.id);

    expect(found).toEqual(
      expect.objectContaining({
        id: created.id,
        ...createPayload,
      }),
    );
  });

  it('should update a job application', () => {
    const created = service.create(createPayload);

    const updated = service.update(created.id, { status: 'interview' });

    expect(updated).toEqual(
      expect.objectContaining({
        id: created.id,
        position: createPayload.position,
        company: createPayload.company,
        status: 'interview',
      }),
    );
  });

  it('should remove a job application', () => {
    const created = service.create(createPayload);

    service.remove(created.id);

    expect(() => service.findById(created.id)).toThrow(NotFoundException);
  });

  it('should throw NotFoundException when finding non-existing application', () => {
    expect(() => service.findById('non-existing-id')).toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when updating non-existing application', () => {
    expect(() =>
      service.update('non-existing-id', { status: 'rejected' }),
    ).toThrow(NotFoundException);
  });

  it('should throw NotFoundException when removing non-existing application', () => {
    expect(() => service.remove('non-existing-id')).toThrow(NotFoundException);
  });
});
