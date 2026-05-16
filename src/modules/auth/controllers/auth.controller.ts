import { Body, Controller, Get, Header, Post, Query } from '@nestjs/common';
import { CreateUserDTO } from '../dto/create-user';
import { User } from '@domain/entities/User.entitie';
import { AuthService } from '../services/auth.service';
import { AuthenticateUserDTO } from '../dto/authenticate-user';
import { SuccessResponse } from '@shared/response/success.response';
import { AuthLogin } from '@module/auth/types/AuthLogin.type';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

@Controller('auth')
export class AuthController {
  private readonly successTemplate: string;

  constructor(private authService: AuthService) {
    this.successTemplate = readFileSync(
      this.resolveSuccessTemplatePath(),
      'utf8',
    );
  }
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
  ): Promise<SuccessResponse<AuthLogin>> {
    const response = await this.authService.login(body);

    return new SuccessResponse<AuthLogin>(
      response,
      200,
      'User logged up successfully',
    );
  }

  @Get('confirm')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async confirm(@Query('email') email: string): Promise<string> {
    const user = await this.authService.activate(email);

    return this.renderSuccessPage(user.name);
  }

  private renderSuccessPage(userName: string): string {
    return this.successTemplate.replaceAll(
      '{{USER_NAME}}',
      this.escapeHtml(userName),
    );
  }

  private resolveSuccessTemplatePath(): string {
    const fileName = 'account-confirmation-success.html';
    const candidates = [
      join(__dirname, '../../../infrastructure/templates/auth', fileName),
      join(process.cwd(), 'dist/src/infrastructure/templates/auth', fileName),
      join(process.cwd(), 'dist/infrastructure/templates/auth', fileName),
      join(process.cwd(), 'src/infrastructure/templates/auth', fileName),
    ];

    const templatePath = candidates.find((path) => existsSync(path));

    if (!templatePath) {
      throw new Error(
        `Success page template not found. Checked: ${candidates.join(', ')}`,
      );
    }

    return templatePath;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
