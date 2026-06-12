import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

export type EmailEvent = {
  to: string;
  subject: string;
  html: string;
};

export const AUTH_EMAIL_QUEUE = 'auth.email';

@Injectable()
export class EmailPublisher {
  private readonly logger = new Logger(EmailPublisher.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(payload: EmailEvent): Promise<void> {
    try {
      await this.amqpConnection.publish('', AUTH_EMAIL_QUEUE, payload);
      this.logger.log(`Email event queued for ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to queue email for ${payload.to}`, error);
    }
  }
}
