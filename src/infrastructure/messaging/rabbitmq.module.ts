import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { JobEnrichmentPublisher } from './job-enrichment.publisher';
import { JobCreatedPublisher } from './job-created.publisher';
import { UserCredentialsPublisher } from './user-credentials.publisher';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
      exchanges: [
        { name: 'jobs', type: 'direct' },
        { name: 'users', type: 'direct' },
      ],
    }),
  ],
  exports: [
    RabbitMQModule,
    JobEnrichmentPublisher,
    JobCreatedPublisher,
    UserCredentialsPublisher,
  ],
  providers: [
    JobEnrichmentPublisher,
    JobCreatedPublisher,
    UserCredentialsPublisher,
  ],
})
export class RabbitmqModule {}
