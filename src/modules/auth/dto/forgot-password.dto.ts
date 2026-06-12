import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDTO {
  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email!: string;
}
