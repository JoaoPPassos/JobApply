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
import { UserCredentialsPublisher } from '../src/infrastructure/messaging/user-credentials.publisher';
import { RabbitmqModule } from '../src/infrastructure/messaging/rabbitmq.module';
import { MailRepository } from '../src/infrastructure/repositories/mail.repository';
import { WorkerRepository } from '../src/infrastructure/repositories/worker.repository';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilterHandler } from '../src/shared/exceptions/globalFilterHandler';
import { application_status } from '../src/shared/enums/application.enum';
import { source_type } from '../src/shared/enums/source.enum';

@Module({
  providers: [
    {
      provide: JobEnrichmentPublisher,
      useValue: { publishEnrichmentRequest: jest.fn().mockResolvedValue(undefined) },
    },
    {
      provide: JobCreatedPublisher,
      useValue: { publish: jest.fn().mockResolvedValue(undefined) },
    },
    {
      provide: UserCredentialsPublisher,
      useValue: { publish: jest.fn().mockResolvedValue(undefined) },
    },
  ],
  exports: [JobEnrichmentPublisher, JobCreatedPublisher, UserCredentialsPublisher],
})
class MockRabbitmqModule {}

const mockWorkerRepository = {
  addJob: jest.fn().mockResolvedValue('test-job-id'),
  registerJobHandler: jest.fn(),
};

const mockMailRepository = {
  sendMail: jest.fn().mockResolvedValue('test-message-id'),
  mapAccountConfirmationTemplate: jest.fn().mockReturnValue('<html>confirmed</html>'),
};

describe('JobHub API (e2e)', () => {
  let app: INestApplication<App>;

  const TEST_USER = {
    name: 'E2E Test User',
    email: `e2e.${Date.now()}@example.com`,
    password: 'StrongPass123!',
    confirm_password: 'StrongPass123!',
  };

  let accessToken: string;
  let refreshToken: string;
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
      .overrideProvider(WorkerRepository)
      .useValue(mockWorkerRepository)
      .overrideProvider(MailRepository)
      .useValue(mockMailRepository)
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

  // ── AUTH ─────────────────────────────────────────────────────────────

  describe('Auth', () => {
    describe('POST /auth/signUp', () => {
      it('201 – creates a new user', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signUp')
          .send(TEST_USER)
          .expect(201);

        expect(res.body.data.email).toBe(TEST_USER.email);
      });

      it('409 – duplicate email returns conflict', () => {
        return request(app.getHttpServer())
          .post('/auth/signUp')
          .send(TEST_USER)
          .expect(409);
      });

      it('400 – missing required fields', () => {
        return request(app.getHttpServer())
          .post('/auth/signUp')
          .send({ email: 'incomplete@example.com' })
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      it('200 – returns access and refresh tokens', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: TEST_USER.email, password: TEST_USER.password })
          .expect(200);

        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
      });

      it('400 – wrong password', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: TEST_USER.email, password: 'WrongPass!' })
          .expect(400);
      });

      it('404 – unknown email', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'nobody@example.com', password: 'Pass123!' })
          .expect(404);
      });
    });

    describe('GET /auth/confirm', () => {
      it('200 – activates the user account', () => {
        return request(app.getHttpServer())
          .get(`/auth/confirm?email=${encodeURIComponent(TEST_USER.email)}`)
          .expect(200);
      });
    });

    describe('POST /auth/refresh', () => {
      it('200 – returns new access token', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken })
          .expect(200);

        expect(res.body.data.accessToken).toBeDefined();
      });

      it('401 – invalid refresh token', () => {
        return request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken: 'invalid.token.here' })
          .expect(401);
      });
    });
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

    it('401 – GET /applications without token', () => {
      return request(app.getHttpServer()).get('/applications').expect(401);
    });

    describe('POST /applications', () => {
      it('201 – creates an application', async () => {
        const res = await request(app.getHttpServer())
          .post('/applications')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(newApplication)
          .expect(201);

        expect(res.body.data.job.company).toBe('Stripe');
        expect(res.body.data.job.title).toBe('Backend Engineer');
        applicationId = res.body.data.id;
      });

      it('400 – missing required fields', () => {
        return request(app.getHttpServer())
          .post('/applications')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ company: 'Only Company' })
          .expect(400);
      });
    });

    describe('GET /applications', () => {
      it('200 – lists applications', async () => {
        const res = await request(app.getHttpServer())
          .get('/applications')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /applications/:id', () => {
      it('200 – returns a single application', async () => {
        const res = await request(app.getHttpServer())
          .get(`/applications/${applicationId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.data.id).toBe(applicationId);
      });

      it('404 – unknown id', () => {
        return request(app.getHttpServer())
          .get('/applications/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });

    describe('PATCH /applications/:id', () => {
      it('200 – updates application status', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/applications/${applicationId}`)
          .set('Authorization', `Bearer ${accessToken}`)
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
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });

      it('404 – not found after deletion', () => {
        return request(app.getHttpServer())
          .get(`/applications/${applicationId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });
  });
});
