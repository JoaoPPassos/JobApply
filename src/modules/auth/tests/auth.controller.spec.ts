import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDTO } from '../dto/create-user';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@shared/exceptions/exceptions';
import { SuccessResponse } from '@shared/response/success.response';

const mockAuthService = {
  signUp: jest.fn(),
  login: jest.fn(),
  activate: jest.fn(),
  refreshToken: jest.fn(),
  forgotPassword: jest.fn(),
  verifyResetCode: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('POST /auth/signUp', () => {
    const validPayload: CreateUserDTO = {
      name: 'Joao Silva',
      email: 'joao@example.com',
      password: 'StrongPass123!',
      confirm_password: 'StrongPass123!',
    };

    it('should create a user and return it', async () => {
      const expectedUser = {
        id: 'uuid-123',
        name: validPayload.name,
        email: validPayload.email,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockAuthService.signUp.mockResolvedValue(expectedUser);

      const result = await controller.signUp(validPayload);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(validPayload);
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('User signed up successfully');
      expect(result.data).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          name: validPayload.name,
          email: validPayload.email,
        }),
      );
      expect(result.data).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockAuthService.signUp.mockRejectedValue(new ConflictException());

      await expect(controller.signUp(validPayload)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const mismatchPayload = {
        ...validPayload,
        confirm_password: 'different',
      };
      mockAuthService.signUp.mockRejectedValue(new BadRequestException());

      await expect(controller.signUp(mismatchPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid email', async () => {
      const invalidPayload = { ...validPayload, email: 'not-an-email' };
      mockAuthService.signUp.mockRejectedValue(new BadRequestException());

      await expect(controller.signUp(invalidPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for weak password', async () => {
      const weakPayload = {
        ...validPayload,
        password: '123',
        confirm_password: '123',
      };
      mockAuthService.signUp.mockRejectedValue(new BadRequestException());

      await expect(controller.signUp(weakPayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should always return 200 even when email is not registered', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword({
        email: 'anyone@example.com',
      });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        'anyone@example.com',
      );
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeNull();
    });

    it('should propagate unexpected service errors', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('unexpected'));

      await expect(
        controller.forgotPassword({ email: 'anyone@example.com' }),
      ).rejects.toThrow('unexpected');
    });
  });

  describe('POST /auth/verify-reset-code', () => {
    it('should return a reset_token when the code is valid', async () => {
      mockAuthService.verifyResetCode.mockResolvedValue('reset-jwt-token');

      const result = await controller.verifyResetCode({
        email: 'joao@example.com',
        code: '123456',
      });

      expect(mockAuthService.verifyResetCode).toHaveBeenCalledWith(
        'joao@example.com',
        '123456',
      );
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual({ reset_token: 'reset-jwt-token' });
    });

    it('should throw BadRequestException when the code is invalid', async () => {
      mockAuthService.verifyResetCode.mockRejectedValue(
        new BadRequestException('Invalid reset code'),
      );

      await expect(
        controller.verifyResetCode({
          email: 'joao@example.com',
          code: '000000',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the code has expired', async () => {
      mockAuthService.verifyResetCode.mockRejectedValue(
        new BadRequestException('Reset code has expired'),
      );

      await expect(
        controller.verifyResetCode({
          email: 'joao@example.com',
          code: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('POST /auth/reset-password', () => {
    const validBody = {
      reset_token: 'valid-reset-jwt',
      new_password: 'NewStrongPass123!',
      confirm_new_password: 'NewStrongPass123!',
    };

    it('should return 200 and null data on successful reset', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(validBody);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        validBody.reset_token,
        validBody.new_password,
      );
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeNull();
    });

    it('should throw UnauthorizedException when the reset token is invalid', async () => {
      mockAuthService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Invalid or expired reset token'),
      );

      await expect(controller.resetPassword(validBody)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
