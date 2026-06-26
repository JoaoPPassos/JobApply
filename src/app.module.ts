import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '@config/configuration';
import { ApplicationModule } from '@modules/application/application.module';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';
import { JobsModule } from '@modules/jobs/jobs.module';
import { JobApplicationModule } from '@modules/job-application/job-application.module';

@Module({
  imports: [
    ApplicationModule,
    RabbitmqModule,
    JobsModule,
    JobApplicationModule,
    TypeOrmModule.forRoot({ ...configuration }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
