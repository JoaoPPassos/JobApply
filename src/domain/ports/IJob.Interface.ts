import type { Job } from '@domain/entities/Job.entity';

export interface IJob {
  save(data: saveJob): Promise<Job>;
  update(data: updateJob): Promise<Job>;
  delete(id: string): Promise<Job>;
  findById(id: string): Promise<Job>;
  findBy(params: findByParams): Promise<Job | null>;
}

type baseOmit = 'created_at' | 'updated_at' | 'id' | 'deleted_at';

export type findByParams = Partial<
  Pick<Job, 'title' | 'company' | 'description' | 'location'>
>;

export type updateJob = Partial<Omit<Job, baseOmit>> & {
  id: string;
};

export type saveJob = Partial<Omit<Job, baseOmit>>;
