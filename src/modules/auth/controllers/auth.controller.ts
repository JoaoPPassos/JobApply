import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateUserDTO } from '../dto/create-user';
import { User } from '@domain/entities/User.entity';
import { AuthService } from '../services/auth.service';
import { AuthenticateUserDTO } from '../dto/authenticate-user';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { ValidateResetCodeDTO } from '../dto/validate-reset-code.dto';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import { SuccessResponse } from '@shared/response/success.response';
import { AuthLogin, AuthTokens } from '@module/auth/types/AuthLogin.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @ApiQuery({ name: 'token', description: 'Signed confirmation token' })
  @ApiResponse({
    status: 302,
    description: 'Account confirmed, redirects to login',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired confirmation token',
  })
  @Get('confirm')
  @Redirect()
  async confirm(@Query('token') token: string): Promise<{ url: string }> {
    await this.authService.activate(token);

    const loginUrl =
      process.env.LOGIN_URL ||
      `${process.env.APP_URL || 'http://localhost:3000'}/login`;

    return { url: loginUrl };
  }

  @ApiOperation({
    summary: 'Request password reset — sends a 6-digit code to the email',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset code sent if email is registered (always 200)',
  })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDTO,
  ): Promise<SuccessResponse<null>> {
    await this.authService.forgotPassword(body.email);

    return new SuccessResponse<null>(
      null,
      200,
      'If this email is registered, a reset code has been sent',
    );
  }

  @ApiOperation({
    summary:
      'Verify the 6-digit reset code — returns a short-lived reset token',
  })
  @ApiResponse({ status: 200, description: 'Code valid, reset token returned' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @HttpCode(HttpStatus.OK)
  @Post('verify-reset-code')
  async verifyResetCode(
    @Body() body: ValidateResetCodeDTO,
  ): Promise<SuccessResponse<{ reset_token: string }>> {
    const reset_token = await this.authService.verifyResetCode(
      body.email,
      body.code,
    );

    return new SuccessResponse<{ reset_token: string }>(
      { reset_token },
      200,
      'Code verified successfully',
    );
  }

  @ApiOperation({
    summary: 'Reset password using the token from verify-reset-code',
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid token',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired reset token' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDTO,
  ): Promise<SuccessResponse<null>> {
    await this.authService.resetPassword(body.reset_token, body.new_password);

    return new SuccessResponse<null>(null, 200, 'Password reset successfully');
  }
}
