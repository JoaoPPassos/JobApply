import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class JobEnrichmentPublisher {
  private readonly logger = new Logger(JobEnrichmentPublisher.name);

  constructor(private amqpConnection: AmqpConnection) {}

  async publishEnrichmentRequest(payload: {
    jobId: string;
    sourceUrl: string;
    sourcePlatform: string;
  }): Promise<void> {
    try {
      this.logger.log(`Publishing enrichment request for job ${payload.jobId}`);
      await this.amqpConnection.publish('jobs', 'job.enrich', payload);
      this.logger.log(`Published successfully for job ${payload.jobId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish enrichment request for job ${payload.jobId}`,
        error,
      );
    }
  }
}
