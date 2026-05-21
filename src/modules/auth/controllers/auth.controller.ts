import { Body, Controller, Get, Header, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateUserDTO } from '../dto/create-user';
import { User } from '@domain/entities/User.entity';
import { AuthService } from '../services/auth.service';
import { AuthenticateUserDTO } from '../dto/authenticate-user';
import { SuccessResponse } from '@shared/response/success.response';
import { AuthLogin, AuthTokens } from '@module/auth/types/AuthLogin.type';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly successTemplate: string;

  constructor(private authService: AuthService) {
    this.successTemplate = readFileSync(
      this.resolveSuccessTemplatePath(),
      'utf8',
    );
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or passwords mismatch',
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @Post('signUp')
  async signUp(@Body() body: CreateUserDTO): Promise<SuccessResponse<User>> {
    const response = await this.authService.signUp(body);

    return new SuccessResponse<User>(
      response,
      201,
      'User signed up successfully',
    );
  }

  @ApiOperation({ summary: 'Authenticate user and get JWT tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access and refresh tokens',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  async refresh(
    @Body() body: { refreshToken: string },
  ): Promise<SuccessResponse<AuthTokens>> {
    const response = await this.authService.refreshToken(body.refreshToken);

    return new SuccessResponse<AuthTokens>(
      response,
      200,
      'Token refreshed successfully',
    );
  }

  @ApiOperation({ summary: 'Confirm user account via email link' })
  @ApiQuery({ name: 'email', description: 'Email address to confirm' })
  @ApiResponse({
    status: 200,
    description: 'Account confirmed, returns HTML page',
  })
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
