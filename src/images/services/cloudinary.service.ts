import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

import { CustomError, ExceptionHandler } from '../../common/helpers';

type validTypes = 'webp' | 'png' | 'jpeg';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger('CloudinaryService');
  private readonly cloudinary = v2;

  constructor(configService: ConfigService) {
    this.cloudinary.config({
      api_key: configService.get<string>('cloudinaryApiKey'),
      api_secret: configService.get<string>('cloudinaryApiSecret'),
      cloud_name: configService.get<string>('cloudinaryCloudName'),
    });
  }

  async upload(buffer: Buffer, name: string, type: validTypes): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: name,
          format: type,
          folder: type === 'webp' ? 'snapshot/thumbnails' : 'snapshot/hd',
          type: 'upload',
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Error uploading to Cloudinary:', error);
            reject(error?.message || 'Unknown error');
            return;
          }
          resolve(result.secure_url);
        },
      );

      uploadStream.end(buffer);
    }).catch((error) => {
      ExceptionHandler(error);
      return null;
    });
  }

  async destroy(cloudinaryId: string): Promise<void> {
    try {
      const [thumbnail, hd] = await Promise.all([
        this.cloudinary.uploader.destroy(`snapshot/thumbnails/${cloudinaryId}`, { resource_type: 'image' }),
        this.cloudinary.uploader.destroy(`snapshot/hd/${cloudinaryId}`, { resource_type: 'image' }),
      ]);

      if (thumbnail.result !== 'ok' || hd.result !== 'ok') {
        this.logger.error(`Error deleting from Cloudinary, thumbnail: ${thumbnail.result}, hd: ${hd.result}`);
        throw new CustomError({ message: 'Unexpected error', code: 500 });
      }
    } catch (error) {
      ExceptionHandler(error);
    }
  }
}
