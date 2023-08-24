import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateImageDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
