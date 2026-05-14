import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDTO } from '../dto/create-user';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

const mockAuthService = {
  signUp: jest.fn(),
  login: jest.fn(),
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
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          name: validPayload.name,
          email: validPayload.email,
        }),
      );
      expect((result as any).password).toBeUndefined();
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

  // describe('POST /auth/login', () => {
  //   const validCredentials = {
  //     email: 'joao@example.com',
  //     password: 'StrongPass123!',
  //   };

  //   it('should return user and token on valid credentials', async () => {
  //     const expectedResponse = {
  //       token: 'jwt.token.here',
  //       user: {
  //         id: 'uuid-123',
  //         name: 'Joao Silva',
  //         email: validCredentials.email,
  //         created_at: new Date(),
  //         updated_at: new Date(),
  //       },
  //     };
  //     mockAuthService.login.mockResolvedValue(expectedResponse);

  //     const result = await controller.login(validCredentials);

  //     expect(mockAuthService.login).toHaveBeenCalledWith(validCredentials);
  //     expect(result).toEqual(
  //       expect.objectContaining({
  //         token: expect.any(String),
  //         user: expect.objectContaining({
  //           email: validCredentials.email,
  //         }),
  //       }),
  //     );
  //   });

  //   it('should throw UnauthorizedException for wrong password', async () => {
  //     mockAuthService.login.mockRejectedValue(new UnauthorizedException());

  //     await expect(
  //       controller.login({ ...validCredentials, password: 'wrong' }),
  //     ).rejects.toThrow(UnauthorizedException);
  //   });

  //   it('should throw UnauthorizedException for non-existing user', async () => {
  //     mockAuthService.login.mockRejectedValue(new UnauthorizedException());

  //     await expect(
  //       controller.login({ email: 'missing@example.com', password: 'any' }),
  //     ).rejects.toThrow(UnauthorizedException);
  //   });
  // });
});
