import {
  IWorkerService,
  type QueueJobCallback,
} from '@domain/ports/IWorkerService.interface';
import { Injectable } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';

@Injectable()
export class WorkerRepository implements IWorkerService {
  private queue!: Queue;
  private worker!: Worker;
  private jobHandlers: Map<string, QueueJobCallback> = new Map();

  constructor() {
    this.queue = new Queue('Worker', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    });

    this.worker = new Worker(
      'Worker',
      async (job) => {
        const handler = this.jobHandlers.get(job.name);
        if (handler) {
          await handler(job.data as Record<string, any>);
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
      },
    );
  }

  registerJobHandler(event_type: string, callback: QueueJobCallback): void {
    this.jobHandlers.set(event_type, callback);
  }

  async addJob(
    event_type: string,
    data?: Record<string, any>,
    callback?: QueueJobCallback,
  ): Promise<string> {
    if (callback) {
      this.registerJobHandler(event_type, callback);
    }

    const job = await this.queue.add(event_type, data || {});
    return job.id || '';
  }
}
