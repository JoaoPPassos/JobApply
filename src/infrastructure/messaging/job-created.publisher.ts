import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class JobCreatedPublisher {
  private readonly logger = new Logger(JobCreatedPublisher.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(payload: {
    userId: string;
    jobId: string;
    company: string;
    role: string;
  }): Promise<void> {
    try {
      this.logger.log(`Publishing job.created for job ${payload.jobId}`);
      await this.amqpConnection.publish('', 'job.created', payload);
      this.logger.log(`Published job.created successfully for job ${payload.jobId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish job.created for job ${payload.jobId}`,
        error,
      );
    }
  }
}
