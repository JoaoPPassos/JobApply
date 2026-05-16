import { BaseEntity } from '@shared/entitie/base.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { Application } from './Application.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}
