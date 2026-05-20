import { BaseEntity } from '@shared/entitie/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { Application } from './Application.entity';
import { source_type } from '@shared/enums/source.enum';

@Entity()
export class Job extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  company: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  salary_range: string;

  @Column({ type: 'varchar' })
  source_url: string;

  @Column({
    type: 'enum',
    enum: source_type,
  })
  source_platform: string;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar', default: 'pending' })
  metadata_status: string;

  @OneToOne(() => Application, (application) => application.job)
  application: Application;
}
