import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateApplicationDTO {
  @ApiPropertyOptional({ example: 'interviewing' })
  @IsOptional()
  @IsString()
  current_status?: string;

  @ApiPropertyOptional({ example: '2024-02-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  applied_at?: Date;

  @ApiPropertyOptional({ example: 'Got a callback from recruiter' })
  @IsOptional()
  @IsString()
  notes?: string;
}
