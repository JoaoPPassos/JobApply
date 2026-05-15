import { BaseEntity } from '@shared/entitie/base.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';

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
}
