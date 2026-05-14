import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthenticateUserDTO {
  @IsEmail()
  email: string;

  @IsString({ message: 'password is required' })
  @IsNotEmpty()
  password: string;
}
