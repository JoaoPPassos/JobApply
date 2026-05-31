import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Job } from '@domain/entities/Job.entity';
import { SuccessResponse } from '@shared/response/success.response';
import { JobsService } from '../services/jobs.service';
import { UpdateJobMetadataDTO } from '../dto/update-job-metadata.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Update job metadata (called by worker after processing)' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  @ApiResponse({ status: 200, description: 'Job metadata updated successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Patch(':id/metadata')
  async updateMetadata(
    @Param('id') id: string,
    @Body() body: UpdateJobMetadataDTO,
  ): Promise<SuccessResponse<Job>> {
    const data = await this.jobsService.updateMetadata(id, body);
    return new SuccessResponse<Job>(data, 200, 'Job metadata updated successfully');
  }
}
