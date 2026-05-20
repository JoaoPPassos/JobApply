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
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { Application } from '@domain/entities/Application.entity';
import { SuccessResponse } from '@shared/response/success.response';
import { ApplicationService } from '../services/application.service';
import { CreateApplicationDTO } from '../dto/create-application.dto';
import { UpdateApplicationDTO } from '../dto/update-application.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

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
