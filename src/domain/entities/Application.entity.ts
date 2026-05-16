import { BaseEntity } from '@shared/entitie/base.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
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

  @Column({ type: 'text' })
  notes: string;

  @ManyToOne(() => User, (user) => user.applications)
  user: User;

  @OneToOne((type) => Job, (job) => job.application)
  job: Job;

  @OneToMany(
    (type) => ApplicationStatusHistory,
    (statusHistory) => statusHistory.application,
  )
  statusHistory: ApplicationStatusHistory[];

  @OneToOne((type) => Contact, (contact) => contact.application)
  contact: Contact;
}
