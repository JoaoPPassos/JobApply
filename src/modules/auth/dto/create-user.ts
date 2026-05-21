import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'name is required' })
  name: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString({ message: 'password is required' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString({ message: 'confirm_password is required' })
  @IsNotEmpty()
  confirm_password: string;
}
