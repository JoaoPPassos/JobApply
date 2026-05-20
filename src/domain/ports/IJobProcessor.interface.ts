import type { Job } from '@domain/entities/Job.entity';

export interface IJobProcessor {
  process(
    source_url: string,
    source_platform: string,
  ): Promise<JobProcessorResult>;
}

export type JobProcessorResult = Pick<
  Job,
  'title' | 'company' | 'description' | 'salary_range' | 'location'
>;
