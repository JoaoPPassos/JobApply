import { NotFoundException } from '@domain/errors/exceptions';
import { BadRequestException } from '@shared/exceptions/exceptions';
import { AuthService } from '../services/auth.service';
import { CreateUserDTO } from '../dto/create-user';
import { AuthRepository } from '@infrastructure/repositories/auth.repository';
import { HashRepository } from '@infrastructure/repositories/hash.repository';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: {
    authenticate: jest.Mock;
    findByEmail: jest.Mock;
    findByID: jest.Mock;
    save: jest.Mock;
  };
  let hashRepository: {
    compare: jest.Mock;
    hash: jest.Mock;
  };

  const validPayload: CreateUserDTO = {
    name: 'Joao Silva',
    email: 'joao@example.com',
    password: 'StrongPass123!',
    confirm_password: 'StrongPass123!',
  };

  beforeEach(() => {
    authRepository = {
      authenticate: jest.fn(),
      findByEmail: jest.fn(),
      findByID: jest.fn(),
      save: jest.fn(),
    };
    hashRepository = {
      compare: jest.fn(),
      hash: jest.fn(),
    };

    service = new AuthService(authRepository, hashRepository);
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
      };
      authRepository.findByEmail.mockResolvedValue(storedUser);
      hashRepository.compare.mockResolvedValue(true);
      authRepository.authenticate.mockResolvedValue('token-123');

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
      expect(authRepository.authenticate).toHaveBeenCalledWith({
        ...storedUser,
      });
      expect(result).toBe('token-123');
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
