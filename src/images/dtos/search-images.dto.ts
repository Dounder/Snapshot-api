import { PaginationDto } from './../../common/dto/pagination.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class SearchImagesDto extends PaginationDto {
  @IsUUID()
  @IsOptional()
  user?: string;
}
