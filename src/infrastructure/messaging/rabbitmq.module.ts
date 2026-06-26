import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { JobEnrichmentPublisher } from './job-enrichment.publisher';
import { JobCreatedPublisher } from './job-created.publisher';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
      exchanges: [{ name: 'jobs', type: 'direct' }],
    }),
  ],
  exports: [RabbitMQModule, JobEnrichmentPublisher, JobCreatedPublisher],
  providers: [JobEnrichmentPublisher, JobCreatedPublisher],
})
export class RabbitmqModule {}
