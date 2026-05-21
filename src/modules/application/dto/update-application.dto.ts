import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationDTO {
  @ApiPropertyOptional({ example: 'interviewing' })
  current_status?: string;

  @ApiPropertyOptional({ example: '2024-02-01' })
  applied_at?: Date;

  @ApiPropertyOptional({ example: 'Got a callback from recruiter' })
  notes?: string;
}
