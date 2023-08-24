import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getPixels } from '@unpic/pixels';
import { encode } from 'blurhash';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { ExceptionHandler } from '../common/helpers';
import { Image } from './entities/image.entity';
import { CloudinaryService } from './services/cloudinary.service';

interface Args {
  buffer: Buffer;
  width?: number;
  height?: number;
  quality?: number;
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

  async create(files: Array<Express.Multer.File>): Promise<Image[]> {
    try {
      const promises = files.map(async (file) => {
        const filename = file.originalname.split('.')[0];
        const [thumbnail, hd] = await Promise.all([
          this.resizeImage({ buffer: file.buffer }),
          this.resizeImage({ buffer: file.buffer, width: 1920, height: 1080, quality: 80 }),
        ]);
        const [url, downloadUrl, blurhash] = await Promise.all([
          this.cloudinaryService.upload(thumbnail, filename),
          this.cloudinaryService.upload(hd, `${filename}_hd`, 'png'),
          this.createBlurhash(file),
        ]);

        return { name: file.originalname, url, blurhash, downloadUrl };
      });

      const images = await Promise.all(promises);

      return this.imageRepository.save(images);
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  findAll() {
    return `This action returns all images`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  update(id: number) {
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }

  private async resizeImage(args: Args): Promise<Buffer> {
    try {
      const { buffer, width = 1280, height = 720, quality = 50, type = 'webp' } = args;

      const image = sharp(buffer).resize(width, height, { fit: 'cover', position: 'center' }).withMetadata({ orientation: 1 });

      switch (type) {
        case 'webp':
          return await image.webp({ quality }).toBuffer();
        case 'png':
          return await image.png({ quality }).toBuffer();
        case 'jpeg':
          return await image.jpeg({ quality }).toBuffer();
        default:
          return await image.toBuffer();
      }
    } catch (error) {
      this.logger.error('Error while resizing image', error);
      throw new Error('Error while resizing image');
    }
  }

  private async createBlurhash(file: Express.Multer.File): Promise<string> {
    const image = await sharp(file.buffer).resize(32, 32).withMetadata({ orientation: 1 }).png().toBuffer();
    const jpgData = await getPixels(image);
    const data = Uint8ClampedArray.from(jpgData.data);
    return encode(data, jpgData.width, jpgData.height, 4, 3);
  }
}
