import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  token: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
