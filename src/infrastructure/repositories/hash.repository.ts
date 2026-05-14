import { Injectable } from '@nestjs/common';
import { IHashService } from '@domain/interfaces/IHashService.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashRepository implements IHashService {
  private saltOrRounds = 10;
  constructor() {}

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltOrRounds);
  }
}
