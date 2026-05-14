import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '@config/configuration';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forRoot({ ...configuration })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
