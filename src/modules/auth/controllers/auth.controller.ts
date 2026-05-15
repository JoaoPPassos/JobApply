import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from '../dto/create-user';
import { User } from '@domain/entities/User.entitie';
import { AuthService } from '../services/auth.service';
import { AuthenticateUserDTO } from '../dto/authenticate-user';
import { SuccessResponse } from '@shared/response/success.response';
import { IAuthLogin } from '@module/auth/types/AuthLogin.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signUp')
  async signUp(@Body() body: CreateUserDTO): Promise<SuccessResponse<User>> {
    const response = await this.authService.signUp(body);

    return new SuccessResponse<User>(
      response,
      201,
      'User signed up successfully',
    );
  }

  @Post('login')
  async login(
    @Body() body: AuthenticateUserDTO,
  ): Promise<SuccessResponse<IAuthLogin>> {
    const response = await this.authService.login(body);

    return new SuccessResponse<IAuthLogin>(
      response,
      200,
      'User logged up successfully',
    );
  }
}
