import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@shared/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '@domain/entities/Application.entity';
import {
  IApplication,
  saveApplication,
  updateApplication,
} from '@domain/ports/IApplication.interface';

@Injectable()
export class ApplicationRepository implements IApplication {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async save(data: saveApplication): Promise<Application> {
    return await this.applicationRepository.save(data);
  }

  async findAll(): Promise<Application[]> {
    return await this.applicationRepository.find({
      relations: ['job', 'contact', 'user'],
    });
  }

  async findById(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'contact', 'user'],
    });

    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    return application;
  }

  async findByUserId(userId: string): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: { user: { id: userId } },
      relations: ['job', 'contact', 'user'],
    });
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: { job: { id: jobId } },
      relations: ['job', 'contact', 'user'],
    });
  }

  async findByStatus(status: string): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: { current_status: status },
      relations: ['job', 'contact', 'user'],
    });
  }

  async update(id: string, data: updateApplication): Promise<Application> {
    const application = await this.findById(id);
    return await this.applicationRepository.save({
      ...application,
      ...data,
      updated_at: new Date(),
    });
  }

  async remove(id: string): Promise<void> {
    const application = await this.findById(id);
    await this.applicationRepository.remove(application);
  }
}
