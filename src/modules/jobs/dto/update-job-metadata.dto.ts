import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { application_status } from '@shared/enums/application.enum';

export class UpdateJobMetadataDTO {
  @ApiPropertyOptional({ example: 'Backend Engineer' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Stripe' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    example: 'Full-stack role focused on payments infrastructure.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Remote' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '$120k–$160k' })
  @IsOptional()
  @IsString()
  salary_range?: string;

  @ApiPropertyOptional({
    enum: application_status,
    example: application_status.in_review,
  })
  @IsOptional()
  @IsEnum(application_status)
  status?: application_status;
}
