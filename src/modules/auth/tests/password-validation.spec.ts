import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDTO } from '../dto/create-user';
import { ResetPasswordDTO } from '../dto/reset-password.dto';

const toCreateUserDTO = (plain: object) =>
  plainToInstance(CreateUserDTO, plain);
const toResetPasswordDTO = (plain: object) =>
  plainToInstance(ResetPasswordDTO, plain);

const base = {
  name: 'Joao Silva',
  email: 'joao@example.com',
  password: 'StrongPass123!',
  confirm_password: 'StrongPass123!',
};

describe('CreateUserDTO — password strength', () => {
  it('should pass with a strong password', async () => {
    const errors = await validate(toCreateUserDTO(base));
    expect(errors).toHaveLength(0);
  });

  it('should fail when password is too short', async () => {
    const dto = toCreateUserDTO({ ...base, password: 'Ab1!', confirm_password: 'Ab1!' });
    const errors = await validate(dto);
    const field = errors.find((e) => e.property === 'password');
    expect(field).toBeDefined();
  });

  it('should fail when password has no uppercase letter', async () => {
    const dto = toCreateUserDTO({
      ...base,
      password: 'weakpass1!',
      confirm_password: 'weakpass1!',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'password')).toBeDefined();
  });

  it('should fail when password has no lowercase letter', async () => {
    const dto = toCreateUserDTO({
      ...base,
      password: 'WEAKPASS1!',
      confirm_password: 'WEAKPASS1!',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'password')).toBeDefined();
  });

  it('should fail when password has no digit', async () => {
    const dto = toCreateUserDTO({
      ...base,
      password: 'WeakPass!!',
      confirm_password: 'WeakPass!!',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'password')).toBeDefined();
  });

  it('should fail when password has no special character', async () => {
    const dto = toCreateUserDTO({
      ...base,
      password: 'WeakPass123',
      confirm_password: 'WeakPass123',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'password')).toBeDefined();
  });
});

describe('CreateUserDTO — confirm_password match', () => {
  it('should fail when confirm_password does not match password', async () => {
    const dto = toCreateUserDTO({ ...base, confirm_password: 'Different1!' });
    const errors = await validate(dto);
    const field = errors.find((e) => e.property === 'confirm_password');
    expect(field).toBeDefined();
    expect(Object.keys(field!.constraints ?? {})).toContain('match');
  });

  it('should pass when confirm_password matches password', async () => {
    const errors = await validate(toCreateUserDTO(base));
    expect(errors.find((e) => e.property === 'confirm_password')).toBeUndefined();
  });
});

describe('ResetPasswordDTO — password strength and match', () => {
  const baseReset = {
    reset_token: 'some-jwt-token',
    new_password: 'NewStrongPass123!',
    confirm_new_password: 'NewStrongPass123!',
  };

  it('should pass with valid data', async () => {
    const errors = await validate(toResetPasswordDTO(baseReset));
    expect(errors).toHaveLength(0);
  });

  it('should fail when new_password is weak', async () => {
    const dto = toResetPasswordDTO({
      ...baseReset,
      new_password: 'weak',
      confirm_new_password: 'weak',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'new_password')).toBeDefined();
  });

  it('should fail when confirm_new_password does not match', async () => {
    const dto = toResetPasswordDTO({
      ...baseReset,
      confirm_new_password: 'DifferentPass1!',
    });
    const errors = await validate(dto);
    const field = errors.find((e) => e.property === 'confirm_new_password');
    expect(field).toBeDefined();
    expect(Object.keys(field!.constraints ?? {})).toContain('match');
  });
});
