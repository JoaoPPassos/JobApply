import { BaseEntity } from '@shared/entitie/base.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { Application } from './Application.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password!: string;

  @Column({ type: 'boolean', default: false })
  is_active!: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  @Exclude()
  email_password!: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @Exclude()
  reset_password_code!: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  reset_password_expires_at!: Date | null;

  @OneToMany(() => Application, (application) => application.user)
  applications!: Application[];
}
