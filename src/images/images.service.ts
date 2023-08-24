import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getPixels } from '@unpic/pixels';
import { encode } from 'blurhash';
import crypto from 'crypto';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ExceptionHandler } from '../common/helpers';
import { CreateImageDto } from './dtos/create-image.dto';
import { Image } from './entities/image.entity';
import { CloudinaryService } from './services/cloudinary.service';

interface Args {
  file: Express.Multer.File;
  type?: 'webp' | 'png' | 'jpeg';
}

@Injectable()
export class ImagesService {
  private readonly logger = new Logger('ImagesService');

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(files: Array<Express.Multer.File>, createImageDto: CreateImageDto): Promise<Image[]> {
    try {
      const promises = files.map(async (file) => {
        const filename = file.originalname.split('.')[0];
        const cloudinaryId = `${filename}__${crypto.randomBytes(8).toString('hex')}`;
        const [thumbnail, hd] = await Promise.all([this.resizeImage({ file }), this.resizeImage({ file, type: 'jpeg' })]);
        const [url, downloadUrl, blurhash] = await Promise.all([
          this.cloudinaryService.upload(thumbnail, cloudinaryId, 'webp'),
          this.cloudinaryService.upload(hd, cloudinaryId, 'jpeg'),
          this.createBlurhash(file),
        ]);

        return { name: filename, cloudinaryId, url, blurhash, downloadUrl, userId: createImageDto.userId };
      });

      const images = await Promise.all(promises);

      return this.imageRepository.save(images);
      return [];
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async findAll(pagination: PaginationDto, userId: string = null): Promise<Image[]> {
    try {
      const { offset, limit } = pagination;

      const query = this.imageRepository
        .createQueryBuilder('image')
        .offset(offset)
        .take(limit)
        .innerJoinAndSelect('image.user', 'user')
        .select(['image', 'user.id', 'user.username', 'user.name', 'user.lastName']);

      if (userId) query.andWhere('image.userId = :userId', { userId });

      return await query.getMany();
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async findAllPublic() {
    try {
      return await this.imageRepository.createQueryBuilder().where('public = :public', { public: true }).orderBy('RANDOM()').limit(6).getMany();
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async remove(id: string): Promise<{ msg: string }> {
    const image = await this.imageRepository.findOneBy({ id });

    if (!image) throw new NotFoundException('Image not found');

    await this.cloudinaryService.destroy(image.cloudinaryId);
    await this.imageRepository.delete(id);

    return { msg: `Image ${image.name} deleted` };
  }

  private async resizeImage(args: Args): Promise<Buffer> {
    try {
      const { file, type = 'webp' } = args;
      const { width, height } = await this.getDimensions({ file, type });

      const image = sharp(file.buffer).resize(width, height, { fit: 'cover', position: 'center' }).withMetadata({ orientation: 1 });

      switch (type) {
        case 'webp':
          return await image.webp({ quality: 50 }).toBuffer();
        case 'png':
          return await image.png({ quality: 100 }).toBuffer();
        case 'jpeg':
          return await image.jpeg({ quality: 100 }).toBuffer();
        default:
          return await image.toBuffer();
      }
    } catch (error) {
      this.logger.error('Error while resizing image', error);
      throw new Error('Error while resizing image');
    }
  }

  private async getDimensions(args: Args): Promise<{ width: number; height: number }> {
    const { file, type } = args;
    const dimensions = await sharp(file.buffer).metadata();

    if (type === 'webp')
      return {
        width: dimensions.width > dimensions.height ? 1280 : 720,
        height: dimensions.width > dimensions.height ? 720 : 1080,
      };

    return {
      width: dimensions.width > dimensions.height ? 2560 : 1440,
      height: dimensions.width > dimensions.height ? 1440 : 2160,
    };
  }

  private async createBlurhash(file: Express.Multer.File): Promise<string> {
    const image = await sharp(file.buffer).resize(32, 32).withMetadata({ orientation: 1 }).png().toBuffer();
    const jpgData = await getPixels(image);
    const data = Uint8ClampedArray.from(jpgData.data);
    return encode(data, jpgData.width, jpgData.height, 4, 3);
  }
}
