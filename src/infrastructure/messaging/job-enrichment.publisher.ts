import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobEnrichmentPublisher {
  constructor(private amqpConnection: AmqpConnection) {}
  async publishEnrichmentRequest(payload: {
    jobId: string;
    sourceUrl: string;
    sourcePlatform: string;
  }): Promise<void> {
    await this.amqpConnection.publish('jobs', 'job.enrich', payload);
  }
}
