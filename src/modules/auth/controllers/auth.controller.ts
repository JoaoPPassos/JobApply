import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from '../dto/create-user';
import { User } from '@domain/entities/User.entitie';
import { AuthService } from '../services/auth.service';
import { AuthenticateUserDTO } from '../dto/authenticate-user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signUp')
  async signUp(@Body() body: CreateUserDTO): Promise<User> {
    return await this.authService.signUp(body);
  }

  @Post('login')
  async login(@Body() body: AuthenticateUserDTO): Promise<string> {
    return await this.authService.login(body);
  }
}
