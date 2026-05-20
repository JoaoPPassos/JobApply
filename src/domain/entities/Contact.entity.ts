import { BaseEntity } from '@shared/entitie/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { Application } from './Application.entity';

@Entity()
export class Contact extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  role: string;

  @OneToOne(() => Application, (application) => application.contact)
  application: Application;
}
