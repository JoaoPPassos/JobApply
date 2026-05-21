import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { Application } from '@domain/entities/Application.entity';
import { SuccessResponse } from '@shared/response/success.response';
import { ApplicationService } from '../services/application.service';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';

@ApiTags('applications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @ApiOperation({
    summary: 'List all applications (filterable by user, job or status)',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'job_id',
    required: false,
    description: 'Filter by job ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by application status',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(
    @Query('user_id') user_id?: string,
    @Query('job_id') job_id?: string,
    @Query('status') status?: string,
  ): Promise<SuccessResponse<Application[]>> {
    let data: Application[];

    if (user_id) data = await this.applicationService.findByUserId(user_id);
    else if (job_id) data = await this.applicationService.findByJobId(job_id);
    else if (status) data = await this.applicationService.findByStatus(status);
    else data = await this.applicationService.findAll();

    return new SuccessResponse<Application[]>(
      data,
      200,
      'Applications retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Get a single application by ID' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse<Application>> {
    const data = await this.applicationService.findById(id);
    return new SuccessResponse<Application>(
      data,
      200,
      'Application retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @Body() createApplicationDTO: CreateApplicationDTO,
  ): Promise<SuccessResponse<Application>> {
    const data = await this.applicationService.create(createApplicationDTO);
    return new SuccessResponse<Application>(
      data,
      201,
      'Application created successfully',
    );
  }

  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDTO: UpdateApplicationDTO,
  ): Promise<SuccessResponse<Application>> {
    const data = await this.applicationService.update(id, updateApplicationDTO);
    return new SuccessResponse<Application>(
      data,
      200,
      'Application updated successfully',
    );
  }

  @ApiOperation({ summary: 'Delete an application' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse<null>> {
    await this.applicationService.remove(id);
    return new SuccessResponse<null>(
      null,
      200,
      'Application removed successfully',
    );
  }
}
