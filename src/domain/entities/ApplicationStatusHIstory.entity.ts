import { BaseEntity } from '@shared/entitie/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Application } from './Application.entity';
import { application_status } from '@shared/enums/application.enum';
import { source_type } from '@shared/enums/source.enum';

@Entity()
export class ApplicationStatusHistory extends BaseEntity {
  @ManyToOne((type) => Application, (application) => application.statusHistory)
  application: Application;

  @Column({ type: 'enum', enum: application_status })
  status: string;

  @Column('timestamp')
  changed_at: Date;

  @Column({ type: 'enum', enum: source_type })
  source_type: string;
}
