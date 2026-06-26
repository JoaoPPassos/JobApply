import {
  ClassSerializerInterceptor,
  INestApplication,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { JobCreatedPublisher } from '../src/infrastructure/messaging/job-created.publisher';
import { JobEnrichmentPublisher } from '../src/infrastructure/messaging/job-enrichment.publisher';
import { RabbitmqModule } from '../src/infrastructure/messaging/rabbitmq.module';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilterHandler } from '../src/shared/exceptions/globalFilterHandler';
import { application_status } from '../src/shared/enums/application.enum';
import { source_type } from '../src/shared/enums/source.enum';

@Module({
  providers: [
    {
      provide: JobEnrichmentPublisher,
      useValue: {
        publishEnrichmentRequest: jest.fn().mockResolvedValue(undefined),
      },
    },
    {
      provide: JobCreatedPublisher,
      useValue: { publish: jest.fn().mockResolvedValue(undefined) },
    },
  ],
  exports: [JobEnrichmentPublisher, JobCreatedPublisher],
})
class MockRabbitmqModule {}

describe('JobHub API (e2e)', () => {
  let app: INestApplication<App>;

  const TEST_USER_ID = 'e2e-user-uuid-001';
  let applicationId: string;

  beforeAll(async () => {
    const pgClient = new Client({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: 'postgres',
    });
    await pgClient.connect();
    await pgClient.query('CREATE DATABASE jobhub_test').catch(() => {});
    await pgClient.end();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(RabbitmqModule)
      .useModule(MockRabbitmqModule)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilterHandler());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── APPLICATIONS ──────────────────────────────────────────────────────

  describe('Applications', () => {
    const newApplication = {
      job_source_url: 'https://linkedin.com/jobs/123456',
      company: 'Stripe',
      role: 'Backend Engineer',
      source_platform: source_type.linkedin,
      current_status: application_status.applied,
      applied_at: '2024-01-15',
    };

    it('401 – GET /applications without x-user-id header', () => {
      return request(app.getHttpServer()).get('/applications').expect(401);
    });

    describe('POST /applications', () => {
      it('201 – creates an application', async () => {
        const res = await request(app.getHttpServer())
          .post('/applications')
          .set('x-user-id', TEST_USER_ID)
          .send(newApplication)
          .expect(201);

        expect(res.body.data.job.company).toBe('Stripe');
        expect(res.body.data.job.title).toBe('Backend Engineer');
        applicationId = res.body.data.id;
      });

      it('400 – missing required fields', () => {
        return request(app.getHttpServer())
          .post('/applications')
          .set('x-user-id', TEST_USER_ID)
          .send({ company: 'Only Company' })
          .expect(400);
      });
    });

    describe('GET /applications', () => {
      it('200 – lists applications', async () => {
        const res = await request(app.getHttpServer())
          .get('/applications')
          .set('x-user-id', TEST_USER_ID)
          .expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /applications/:id', () => {
      it('200 – returns a single application', async () => {
        const res = await request(app.getHttpServer())
          .get(`/applications/${applicationId}`)
          .set('x-user-id', TEST_USER_ID)
          .expect(200);

        expect(res.body.data.id).toBe(applicationId);
      });

      it('404 – unknown id', () => {
        return request(app.getHttpServer())
          .get('/applications/00000000-0000-0000-0000-000000000000')
          .set('x-user-id', TEST_USER_ID)
          .expect(404);
      });
    });

    describe('PATCH /applications/:id', () => {
      it('200 – updates application status', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/applications/${applicationId}`)
          .set('x-user-id', TEST_USER_ID)
          .send({
            current_status: application_status.in_review,
            notes: 'Recruiter replied',
          })
          .expect(200);

        expect(res.body.data.current_status).toBe(application_status.in_review);
      });
    });

    describe('DELETE /applications/:id', () => {
      it('200 – removes the application', () => {
        return request(app.getHttpServer())
          .delete(`/applications/${applicationId}`)
          .set('x-user-id', TEST_USER_ID)
          .expect(200);
      });

      it('404 – not found after deletion', () => {
        return request(app.getHttpServer())
          .get(`/applications/${applicationId}`)
          .set('x-user-id', TEST_USER_ID)
          .expect(404);
      });
    });
  });
});
