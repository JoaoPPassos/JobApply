import {
  NotFoundException,
  BadRequestException,
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
  };
  let hashRepository: {
    compare: jest.Mock;
    hash: jest.Mock;
  };
  let mailRepository: {
    mapAccountConfirmationTemplate: jest.Mock;
  };
  let workerRepository: {
    addJob: jest.Mock;
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
    };
    hashRepository = {
      compare: jest.fn(),
      hash: jest.fn(),
    };
    mailRepository = {
      mapAccountConfirmationTemplate: jest
        .fn()
        .mockReturnValue('<html>Confirmation</html>'),
    };
    workerRepository = {
      addJob: jest.fn().mockResolvedValue('job-id'),
    };

    service = new AuthService(
      authRepository as any,
      hashRepository as any,
      mailRepository as any,
      workerRepository as any,
    );
  });

  describe('signUp', () => {
    it('should hash the password before saving the user', async () => {
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
      expect(workerRepository.addJob).toHaveBeenCalledWith(
        'email',
        {},
        expect.any(Function),
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
      expect(authRepository.authenticateRefresh).toHaveBeenCalledWith(
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
          user: expect.objectContaining({
            email: validPayload.email,
          }),
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
});
