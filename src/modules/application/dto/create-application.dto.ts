import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactDTO {
  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'jane.doe@company.com' })
  email: string;

  @ApiProperty({ example: 'Engineering Manager' })
  role: string;
}

export class CreateApplicationDTO {
  @ApiProperty({ example: 'https://linkedin.com/jobs/123' })
  job_source_url: string;

  @ApiProperty({ example: 'LinkedIn' })
  source_platform: string;

  @ApiProperty({ example: 'uuid-of-user' })
  user_id: string;

  @ApiProperty({ example: 'applied' })
  current_status: string;

  @ApiProperty({ example: '2024-01-15' })
  applied_at: Date;

  @ApiPropertyOptional({ example: 'Applied through a referral' })
  notes?: string;

  @ApiProperty({ type: ContactDTO })
  contact: ContactDTO;
}
