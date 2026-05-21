import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { source_type } from '@shared/enums/source.enum';
import { application_status } from '@shared/enums/application.enum';

export class ContactDTO {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'jane.doe@company.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Engineering Manager' })
  @IsString()
  @IsNotEmpty()
  role!: string;
}

export class CreateApplicationDTO {
  @ApiProperty({ example: 'https://linkedin.com/jobs/123' })
  @IsString()
  @IsNotEmpty()
  job_source_url!: string;

  @ApiProperty({ enum: source_type, example: source_type.linkedin })
  @IsEnum(source_type)
  source_platform!: source_type;

  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  user_id!: string;

  @ApiProperty({ enum: application_status, example: application_status.applied })
  @IsEnum(application_status)
  current_status!: application_status;

  @ApiProperty({ example: '2024-01-15' })
  @IsDate()
  @Type(() => Date)
  applied_at!: Date;

  @ApiPropertyOptional({ example: 'Applied through a referral' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: ContactDTO })
  @ValidateNested()
  @Type(() => ContactDTO)
  contact!: ContactDTO;
}
