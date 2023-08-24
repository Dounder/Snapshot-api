import { Column, Entity, Index, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { Image } from './../../images/entities/image.entity';

@Entity('users')
@Index('username_ix', ['username'], { unique: true })
@Index('email_ix', ['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: [UserRole.USER], array: true })
  roles: UserRole[];

  @OneToMany(() => Image, (image) => image.user)
  images: Relation<Image[]>;
}
