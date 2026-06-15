import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailPasswordDTO {
  @ApiProperty({
    example: 'myapp_password123',
    description: 'Plain-text email password — will be encrypted by the service',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
