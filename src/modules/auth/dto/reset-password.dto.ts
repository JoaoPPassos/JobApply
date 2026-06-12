import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Match } from '@shared/validators/match.validator';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export class ResetPasswordDTO {
  @ApiProperty({ description: 'Token received from verify-reset-code endpoint' })
  @IsString()
  @IsNotEmpty()
  reset_token!: string;

  @ApiProperty({ example: 'NewStrongPass123!' })
  @IsString()
  @IsNotEmpty()
  @Matches(STRONG_PASSWORD_REGEX, {
    message:
      'new_password must be at least 8 characters and include uppercase, lowercase, number and special character',
  })
  new_password!: string;

  @ApiProperty({ example: 'NewStrongPass123!' })
  @IsString()
  @IsNotEmpty()
  @Match('new_password', {
    message: 'confirm_new_password must match new_password',
  })
  confirm_new_password!: string;
}
