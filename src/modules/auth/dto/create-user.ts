import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsString({ message: 'name is required' })
  name: string;

  @IsEmail()
  email: string;

  @IsString({ message: 'password is required' })
  @IsNotEmpty()
  password: string;

  @IsString({ message: 'confirm_password is required' })
  @IsNotEmpty()
  confirm_password: string;
}
