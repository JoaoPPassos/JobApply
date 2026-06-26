import type { Application } from '@domain/entities/Application.entity';
import type { Contact } from '@domain/entities/Contact.entity';
import type { Job } from '@domain/entities/Job.entity';

export interface IApplication {
  save(data: saveApplication): Promise<Application>;
  findAll(): Promise<Application[]>;
  findById(id: string): Promise<Application>;
  findByUserId(userId: string): Promise<Application[]>;
  findByJobId(jobId: string): Promise<Application[]>;
  findByStatus(status: string): Promise<Application[]>;
  update(id: string, data: updateApplication): Promise<Application>;
  remove(id: string): Promise<void>;
}

type baseOmit = 'created_at' | 'updated_at' | 'id' | 'deleted_at';

export type saveApplication = Partial<Omit<Application, baseOmit>> & {
  user_id: string;
  job: Job;
  contact?: Contact;
};

export type updateApplication = {
  current_status?: string;
  notes?: string;
  applied_at?: Date;
};
