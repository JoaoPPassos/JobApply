import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '@shared/validators/match.validator';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export class CreateUserDTO {
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'name is required' })
  name!: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString({ message: 'password is required' })
  @IsNotEmpty()
  @Matches(STRONG_PASSWORD_REGEX, {
    message:
      'password must be at least 8 characters and include uppercase, lowercase, number and special character',
  })
  password!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString({ message: 'confirm_password is required' })
  @IsNotEmpty()
  @Match('password', { message: 'confirm_password must match password' })
  confirm_password!: string;
}
