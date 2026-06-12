import { BaseEntity } from '@shared/entitie/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './User.entity';
import { Job } from './Job.entity';
import { application_status } from '@shared/enums/application.enum';
import { ApplicationStatusHistory } from './ApplicationStatusHIstory.entity';
import { Contact } from './Contact.entity';

@Entity()
export class Application extends BaseEntity {
  @Column({
    type: 'enum',
    enum: application_status,
  })
  current_status: string;

  @Column({ type: 'timestamp' })
  applied_at: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User, (user) => user.applications)
  user: User;

  @OneToOne(() => Job, (job) => job.application, { cascade: true })
  @JoinColumn()
  job: Job;

  @OneToMany(
    () => ApplicationStatusHistory,
    (statusHistory) => statusHistory.application,
  )
  statusHistory: ApplicationStatusHistory[];

  @OneToOne(() => Contact, (contact) => contact.application, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  contact?: Contact;
}
