import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('images')
export class Image extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  downloadUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  blurhash: string;
}
