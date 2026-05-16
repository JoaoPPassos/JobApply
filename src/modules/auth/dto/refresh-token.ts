import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDTO {
  @IsString({ message: 'refreshToken is required' })
  @IsNotEmpty()
  refreshToken!: string;
}
