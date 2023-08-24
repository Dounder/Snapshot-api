import { BadRequestException } from '@nestjs/common';

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => {
  const mimeRegex = /^image\/(jpeg|png|gif|jpg)$/;

  if (!mimeRegex.test(file.mimetype)) return callback(new BadRequestException(`File ${file.originalname} is not an image`), false);

  callback(null, true);
};
