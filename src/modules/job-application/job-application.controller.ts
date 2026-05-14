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
  findAll(): JobApplication[] {
    return this.jobApplicationService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): JobApplication | null {
    const jobApplication = this.jobApplicationService.findById(id);

    // if(jobApplication == null) return
    return jobApplication;
  }

  @Post()
  create(@Body() body: CreateJobApplicationDTO): CreateJobApplicationDTO {
    return this.jobApplicationService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateJobApplicationDTO,
  ): JobApplication {
    return this.jobApplicationService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string): JobApplication[] {
    return this.jobApplicationService.remove(id);
  }
}
