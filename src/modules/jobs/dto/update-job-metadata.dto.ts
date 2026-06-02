import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateJobMetadataDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  description: string;

  @IsString()
  location: string;
}
