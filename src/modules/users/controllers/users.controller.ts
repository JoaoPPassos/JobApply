import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { User } from '@domain/entities/User.entity';
import { SuccessResponse } from '@shared/response/success.response';
import { UsersService } from '../services/users.service';
import { SaveEmailCredentialsDTO } from '@module/auth/dto/save-email-credentials.dto';
import { UpdateEmailPasswordDTO } from '../dto/update-email-password.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  async me(
    @Request() req: { user: { id: string } },
  ): Promise<SuccessResponse<User>> {
    const user = await this.usersService.findById(req.user.id);
    return new SuccessResponse<User>(user, 200, 'User retrieved successfully');
  }

  @ApiOperation({ summary: 'Update the stored encrypted email password' })
  @ApiResponse({ status: 204, description: 'Password updated' })
  @ApiResponse({ status: 400, description: 'encryptedPassword absent or empty' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':userId/password')
  async updateEmailPassword(
    @Param('userId') userId: string,
    @Body() body: UpdateEmailPasswordDTO,
  ): Promise<void> {
    await this.usersService.updateEmailPassword(userId, body.password);
  }

  @ApiOperation({ summary: 'Save IMAP email password for job monitoring' })
  @ApiResponse({ status: 200, description: 'Email credentials saved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('email-credentials')
  async saveEmailCredentials(
    @Body() body: SaveEmailCredentialsDTO,
    @Request() req: { user: { id: string } },
  ): Promise<SuccessResponse<User>> {
    const user = await this.usersService.saveEmailCredentials(
      req.user.id,
      body.email_password,
    );
    return new SuccessResponse<User>(user, 200, 'Email credentials saved');
  }
}
