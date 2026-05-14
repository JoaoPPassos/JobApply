import { Injectable, NotFoundException } from '@nestjs/common';
import { JobApplication } from './interfaces/JobApplication.interface';
import { randomUUID } from 'node:crypto';
import { CreateJobApplicationDTO } from './dto/create-job-application';
import { UpdateJobApplicationDTO } from './dto/update-job-application';

@Injectable()
export class JobApplicationService {
  private applications: JobApplication[] = [];

  constructor() {}

  findAll(): JobApplication[] {
    return this.applications;
  }

  findById(id: string): JobApplication {
    const jobApplication = this.applications.find((data) => data.id === id);

    if (!jobApplication) {
      throw new NotFoundException();
    }

    return jobApplication;
  }

  create(data: CreateJobApplicationDTO): JobApplication {
    const index = this.applications.push({ id: randomUUID(), ...data });

    return this.applications[index - 1];
  }

  update(id: string, data: UpdateJobApplicationDTO): JobApplication {
    const index = this.applications.findIndex((data) => data.id == id);
    if (index == -1) throw new NotFoundException();

    const newObj = { ...this.applications[index], ...data };
    this.applications[index] = newObj;
    return newObj;
  }

  remove(id: string) {
    const array = this.applications.filter((data) => data.id !== id);
    if (array.length === this.applications.length)
      throw new NotFoundException();

    this.applications = array;
    return array;
  }
}
