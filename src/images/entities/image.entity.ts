import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './../../users/entities/user.entity';

@Entity('images')
export class Image extends BaseEntity {
  @Column({ type: 'varchar', length: 1000, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  cloudinaryId: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  url: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  downloadUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  blurhash: string;

  @Column({ type: 'boolean', default: false })
  public: boolean;

  @ManyToOne(() => User, (user) => user.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;
}
