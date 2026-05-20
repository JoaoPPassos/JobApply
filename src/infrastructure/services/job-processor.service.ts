import { Injectable, Logger } from '@nestjs/common';
import {
  IJobProcessor,
  JobProcessorResult,
} from '@domain/ports/IJobProcessor.interface';

@Injectable()
export class JobProcessorService implements IJobProcessor {
  private readonly logger = new Logger(JobProcessorService.name);

  async process(
    source_url: string,
    source_platform: string,
  ): Promise<JobProcessorResult> {
    const metadata = await this.fetchJobMetadata(source_url);

    return {
      title: metadata.title,
      company: metadata.company,
      description: metadata.description,
      salary_range: metadata.salary_range,
      location: metadata.location,
    };
  }

  private async fetchJobMetadata(sourceUrl: string) {
    try {
      const url = new URL(sourceUrl);
      const title = url.searchParams.get('title') || `Job from ${url.hostname}`;
      const company =
        url.searchParams.get('company') || `Company ${url.hostname}`;
      const location = url.searchParams.get('location') || 'Remote';
      const salary_range = url.searchParams.get('salary_range') || 'Negotiable';
      const description =
        url.searchParams.get('description') ||
        `Auto-extracted metadata for a job posted on ${sourceUrl}`;

      return { title, company, location, salary_range, description };
    } catch (error) {
      this.logger.warn(
        `Job processor could not parse URL ${sourceUrl}, using fallback metadata.`,
      );
      return {
        title: `Job from ${sourceUrl}`,
        company: 'Unknown company',
        location: 'Remote',
        salary_range: 'Negotiable',
        description: `Metadata extraction failed for ${sourceUrl}`,
      };
    }
  }
}
