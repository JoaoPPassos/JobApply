import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import type { UpdateJobApplicationDTO } from './dto/update-job-application';
import type { CreateJobApplicationDTO } from './dto/create-job-application';
import type { JobApplication } from './interfaces/JobApplication.interface';

@Controller('job-application')
export class JobApplicationController {
  constructor(private jobApplicationService: JobApplicationService) {}

  @Get()
  async findAll(): Promise<JobApplication[]> {
    return this.jobApplicationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<JobApplication> {
    return this.jobApplicationService.findById(id);
  }

  @Post()
  async create(@Body() body: CreateJobApplicationDTO): Promise<JobApplication> {
    return this.jobApplicationService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateJobApplicationDTO,
  ): Promise<JobApplication> {
    return this.jobApplicationService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<JobApplication[]> {
    return this.jobApplicationService.remove(id);
  }
}
