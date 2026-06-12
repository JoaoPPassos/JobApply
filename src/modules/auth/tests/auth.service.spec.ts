import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@shared/exceptions/exceptions';
import { AuthService } from '../services/auth.service';
import { CreateUserDTO } from '../dto/create-user';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: {
    authenticate: jest.Mock;
    authenticateRefresh: jest.Mock;
    findByEmail: jest.Mock;
    findByID: jest.Mock;
    save: jest.Mock;
    activate: jest.Mock;
    saveResetCode: jest.Mock;
    clearResetCode: jest.Mock;
    updatePassword: jest.Mock;
    generatePasswordResetToken: jest.Mock;
    verifyPasswordResetToken: jest.Mock;
  };
  let hashRepository: {
    compare: jest.Mock;
    hash: jest.Mock;
  };
  let mailRepository: {
    mapAccountConfirmationTemplate: jest.Mock;
    mapPasswordResetTemplate: jest.Mock;
  };
  let emailPublisher: {
    publish: jest.Mock;
  };

  const validPayload: CreateUserDTO = {
    name: 'Joao Silva',
    email: 'joao@example.com',
    password: 'StrongPass123!',
    confirm_password: 'StrongPass123!',
  };

  beforeEach(() => {
    authRepository = {
      authenticateRefresh: jest.fn(),
      authenticate: jest.fn(),
      findByEmail: jest.fn(),
      findByID: jest.fn(),
      save: jest.fn(),
      activate: jest.fn(),
      saveResetCode: jest.fn().mockResolvedValue(undefined),
      clearResetCode: jest.fn().mockResolvedValue(undefined),
      updatePassword: jest.fn().mockResolvedValue(undefined),
      generatePasswordResetToken: jest
        .fn()
        .mockResolvedValue('reset-jwt-token'),
      verifyPasswordResetToken: jest
        .fn()
        .mockResolvedValue({ sub: 'user-id', email: 'joao@example.com' }),
    };
    hashRepository = {
      compare: jest.fn(),
      hash: jest.fn(),
    };
    mailRepository = {
      mapAccountConfirmationTemplate: jest
        .fn()
        .mockReturnValue('<html>Confirmation</html>'),
      mapPasswordResetTemplate: jest.fn().mockReturnValue('<html>Reset</html>'),
    };
    emailPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    service = new AuthService(
      authRepository as any,
      hashRepository as any,
      mailRepository as any,
      emailPublisher as any,
    );
  });

  describe('signUp', () => {
    it('should hash the password and publish a confirmation email event', async () => {
      const hashedPassword = 'hashed-password';
      const savedUser = {
        id: 'uuid-123',
        name: validPayload.name,
        email: validPayload.email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: false,
      };
      hashRepository.hash.mockResolvedValue(hashedPassword);
      authRepository.save.mockResolvedValue(savedUser);

      const result = await service.signUp(validPayload);

      expect(hashRepository.hash).toHaveBeenCalledWith(validPayload.password);
      expect(authRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validPayload.name,
          email: validPayload.email,
          password: hashedPassword,
        }),
      );
      expect(emailPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ to: savedUser.email }),
      );
      expect(result).toEqual(savedUser);
    });

    it('should propagate repository save errors', async () => {
      const error = new Error('save failed');
      hashRepository.hash.mockResolvedValue('hashed-password');
      authRepository.save.mockRejectedValue(error);

      await expect(service.signUp(validPayload)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const storedUser = {
        id: 'uuid-123',
        name: validPayload.name,
        email: validPayload.email,
        password: 'hashed-password',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      authRepository.findByEmail.mockResolvedValue(storedUser);
      hashRepository.compare.mockResolvedValue(true);
      authRepository.authenticate.mockResolvedValue('access-token-123');
      authRepository.authenticateRefresh.mockResolvedValue('refresh-token-456');

      const result = await service.login({
        email: validPayload.email,
        password: validPayload.password,
      });

      expect(authRepository.findByEmail).toHaveBeenCalledWith(
        validPayload.email,
      );
      expect(hashRepository.compare).toHaveBeenCalledWith(
        validPayload.password,
        storedUser.password,
      );
      expect(authRepository.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: storedUser.id,
          email: storedUser.email,
          name: storedUser.name,
          is_active: storedUser.is_active,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          user: expect.objectContaining({ email: validPayload.email }),
        }),
      );
    });

    it('should throw BadRequestException for wrong password', async () => {
      authRepository.findByEmail.mockResolvedValue({
        id: 'uuid-123',
        name: validPayload.name,
        email: validPayload.email,
        password: 'hashed-password',
      });
      hashRepository.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: validPayload.email, password: 'WrongPass!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existing email', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'any' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('forgotPassword', () => {
    const existingUser = {
      id: 'user-id',
      name: 'Joao Silva',
      email: 'joao@example.com',
    };

    it('should generate a 6-digit code, save it hashed and publish the email event', async () => {
      authRepository.findByEmail.mockResolvedValue(existingUser);
      hashRepository.hash.mockResolvedValue('hashed-code');

      await service.forgotPassword(existingUser.email);

      expect(hashRepository.hash).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{6}$/),
      );
      expect(authRepository.saveResetCode).toHaveBeenCalledWith(
        existingUser.id,
        'hashed-code',
        expect.any(Date),
      );
      expect(emailPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ to: existingUser.email }),
      );
    });

    it('should set an expiry roughly 15 minutes from now', async () => {
      authRepository.findByEmail.mockResolvedValue(existingUser);
      hashRepository.hash.mockResolvedValue('hashed-code');

      let capturedExpiry!: Date;
      authRepository.saveResetCode.mockImplementation(
        (_id: string, _code: string, expiresAt: Date) => {
          capturedExpiry = expiresAt;
          return Promise.resolve(undefined);
        },
      );

      const before = Date.now();
      await service.forgotPassword(existingUser.email);
      const after = Date.now();

      expect(capturedExpiry.getTime()).toBeGreaterThanOrEqual(
        before + 14 * 60 * 1000,
      );
      expect(capturedExpiry.getTime()).toBeLessThanOrEqual(
        after + 15 * 60 * 1000 + 100,
      );
    });

    it('should return silently when email is not registered', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.forgotPassword('unknown@example.com'),
      ).resolves.toBeUndefined();

      expect(authRepository.saveResetCode).not.toHaveBeenCalled();
      expect(emailPublisher.publish).not.toHaveBeenCalled();
    });

    it('should pass the raw 6-digit code to the email template', async () => {
      authRepository.findByEmail.mockResolvedValue(existingUser);
      hashRepository.hash.mockResolvedValue('hashed-code');

      await service.forgotPassword(existingUser.email);

      expect(mailRepository.mapPasswordResetTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: existingUser.name,
          code: expect.stringMatching(/^\d{6}$/),
        }),
      );
    });
  });

  describe('verifyResetCode', () => {
    const user = {
      id: 'user-id',
      name: 'Joao Silva',
      email: 'joao@example.com',
      reset_password_code: 'hashed-code',
      reset_password_expires_at: new Date(Date.now() + 10 * 60 * 1000),
    };

    it('should return a reset token when the code is valid', async () => {
      authRepository.findByEmail.mockResolvedValue(user);
      hashRepository.compare.mockResolvedValue(true);

      const token = await service.verifyResetCode(user.email, '123456');

      expect(hashRepository.compare).toHaveBeenCalledWith(
        '123456',
        user.reset_password_code,
      );
      expect(authRepository.generatePasswordResetToken).toHaveBeenCalledWith(
        user.id,
        user.email,
      );
      expect(token).toBe('reset-jwt-token');
    });

    it('should throw BadRequestException when the code is wrong', async () => {
      authRepository.findByEmail.mockResolvedValue(user);
      hashRepository.compare.mockResolvedValue(false);

      await expect(
        service.verifyResetCode(user.email, '000000'),
      ).rejects.toThrow(BadRequestException);

      expect(authRepository.generatePasswordResetToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the code is expired', async () => {
      const expiredUser = {
        ...user,
        reset_password_expires_at: new Date(Date.now() - 1000),
      };
      authRepository.findByEmail.mockResolvedValue(expiredUser);

      await expect(
        service.verifyResetCode(expiredUser.email, '123456'),
      ).rejects.toThrow(BadRequestException);

      expect(hashRepository.compare).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when no reset code exists in the database', async () => {
      const userWithoutCode = {
        ...user,
        reset_password_code: null,
        reset_password_expires_at: null,
      };
      authRepository.findByEmail.mockResolvedValue(userWithoutCode);

      await expect(
        service.verifyResetCode(userWithoutCode.email, '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not found', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.verifyResetCode('unknown@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should hash the new password, update it and clear the reset code', async () => {
      authRepository.verifyPasswordResetToken.mockResolvedValue({
        sub: 'user-id',
        email: 'joao@example.com',
      });
      hashRepository.hash.mockResolvedValue('new-hashed-password');

      await service.resetPassword('valid-reset-token', 'NewStrongPass123!');

      expect(authRepository.verifyPasswordResetToken).toHaveBeenCalledWith(
        'valid-reset-token',
      );
      expect(hashRepository.hash).toHaveBeenCalledWith('NewStrongPass123!');
      expect(authRepository.updatePassword).toHaveBeenCalledWith(
        'user-id',
        'new-hashed-password',
      );
      expect(authRepository.clearResetCode).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException when the reset token is invalid', async () => {
      authRepository.verifyPasswordResetToken.mockRejectedValue(
        new UnauthorizedException('Invalid or expired reset token'),
      );

      await expect(
        service.resetPassword('bad-token', 'NewStrongPass123!'),
      ).rejects.toThrow(UnauthorizedException);

      expect(authRepository.updatePassword).not.toHaveBeenCalled();
      expect(authRepository.clearResetCode).not.toHaveBeenCalled();
    });
  });
});
