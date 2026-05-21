import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JobApplicationService } from './job-application.service';
import { SuccessResponse } from '@shared/response/success.response';
import type { UpdateJobApplicationDTO } from './dto/update-job-application';
import type { CreateJobApplicationDTO } from './dto/create-job-application';
import type { JobApplication } from './interfaces/JobApplication.interface';

@ApiTags('job-application')
@Controller('job-application')
export class JobApplicationController {
  constructor(private jobApplicationService: JobApplicationService) {}

  @ApiOperation({ summary: 'List all job applications' })
  @ApiResponse({ status: 200, description: 'Returns all job applications' })
  @Get()
  async findAll(): Promise<SuccessResponse<JobApplication[]>> {
    const data = await this.jobApplicationService.findAll();
    return new SuccessResponse<JobApplication[]>(
      data,
      200,
      'Job applications retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Get a job application by ID' })
  @ApiParam({ name: 'id', description: 'Job application UUID' })
  @ApiResponse({ status: 200, description: 'Returns the job application' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<SuccessResponse<JobApplication>> {
    const data = await this.jobApplicationService.findById(id);
    return new SuccessResponse<JobApplication>(
      data,
      200,
      'Job application retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Create a new job application' })
  @ApiResponse({ status: 201, description: 'Job application created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post()
  async create(
    @Body() body: CreateJobApplicationDTO,
  ): Promise<SuccessResponse<JobApplication>> {
    const data = await this.jobApplicationService.create(body);
    return new SuccessResponse<JobApplication>(
      data,
      201,
      'Job application created successfully',
    );
  }

  @ApiOperation({ summary: 'Update a job application' })
  @ApiParam({ name: 'id', description: 'Job application UUID' })
  @ApiResponse({ status: 200, description: 'Job application updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateJobApplicationDTO,
  ): Promise<SuccessResponse<JobApplication>> {
    const data = await this.jobApplicationService.update(id, body);
    return new SuccessResponse<JobApplication>(
      data,
      200,
      'Job application updated successfully',
    );
  }

  @ApiOperation({ summary: 'Delete a job application' })
  @ApiParam({ name: 'id', description: 'Job application UUID' })
  @ApiResponse({ status: 200, description: 'Job application deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<SuccessResponse<null>> {
    await this.jobApplicationService.remove(id);
    return new SuccessResponse<null>(
      null,
      200,
      'Job application deleted successfully',
    );
  }
}
