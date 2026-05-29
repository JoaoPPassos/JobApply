import { Injectable, Logger } from '@nestjs/common';
import {
  IJobProcessor,
  JobProcessorResult,
} from '@domain/ports/IJobProcessor.interface';
import { BadRequestException } from '@shared/exceptions/exceptions';

interface LinkedinJobResponse {
  title?: string;
  company?: string | { name?: string };
  location?: string;
  salary?: string;
  description?: string;
}

@Injectable()
export class LinkedinJobProcessorService implements IJobProcessor {
  private readonly logger = new Logger(LinkedinJobProcessorService.name);

  async process(source_url: string): Promise<JobProcessorResult> {
    return this.fetchJobMetadata(source_url);
  }

  private async fetchJobMetadata(
    sourceUrl: string,
  ): Promise<JobProcessorResult> {
    const url = new URL(sourceUrl);
    const match = url.pathname.match(/\/jobs\/view\/(\d+)/);
    const jobId = url.searchParams.get('currentJobId') || match?.[1];

    if (!jobId) throw new BadRequestException('Invalid source_url');

    const response = await fetch(
      `https://linkedin-data-api.p.rapidapi.com/get-job-details?id=${jobId}`,
      {
        headers: {
          'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? '',
        },
      },
    );

    if (!response.ok) {
      this.logger.error(
        `LinkedIn API error ${response.status} for job ${jobId}`,
      );
      throw new BadRequestException(
        `Failed to fetch job details for id ${jobId}`,
      );
    }

    const data = (await response.json()) as LinkedinJobResponse;

    const company =
      typeof data.company === 'object'
        ? (data.company?.name ?? '')
        : (data.company ?? '');

    return {
      title: data.title ?? '',
      company,
      location: data.location ?? '',
      salary_range: data.salary ?? '',
      description: data.description ?? '',
    };
  }
}
