import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserCredentialsPublisher {
  private readonly logger = new Logger(UserCredentialsPublisher.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(payload: {
    userId: string;
    email: string;
    password: string;
  }): Promise<void> {
    try {
      this.logger.log(
        `Publishing user.email.credentials.updated for user ${payload.userId}`,
      );
      // Default exchange ("") routes directly to the queue by name,
      // no explicit binding needed regardless of how the consumer declares its queue.
      await this.amqpConnection.publish(
        '',
        'user.email.credentials.updated',
        payload,
      );
      this.logger.log(
        `Published user.email.credentials.updated for user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish user.email.credentials.updated for user ${payload.userId}`,
        error,
      );
    }
  }
}
