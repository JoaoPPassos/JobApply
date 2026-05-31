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
  salary_range: string;

  @IsString()
  location: string;
}
