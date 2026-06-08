import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveEmailCredentialsDTO {
  @ApiProperty({
    example: 'myapp_password123',
    description: 'App password used for IMAP access (plain text, stored encrypted)',
  })
  @IsString()
  @IsNotEmpty()
  email_password: string;
}
