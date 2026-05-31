import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '@config/configuration';
import { AuthModule } from '@modules/auth/auth.module';
import { ApplicationModule } from '@modules/application/application.module';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';
import { JobsModule } from '@modules/jobs/jobs.module';

@Module({
  imports: [
    AuthModule,
    ApplicationModule,
    RabbitmqModule,
    JobsModule,
    TypeOrmModule.forRoot({ ...configuration }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
