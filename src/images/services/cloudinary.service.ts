import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';
import { ExceptionHandler } from '../../common/helpers';

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

  async upload(buffer: Buffer, name: string, type: 'webp' | 'png' = 'webp'): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: name,
          unique_filename: false,
          overwrite: true,
          format: type,
          folder: 'snapshot',
        },
        (error, result) => {
          if (error || !result) {
            console.error('Error uploading to Cloudinary:', error);
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
}
