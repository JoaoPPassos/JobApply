import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '@domain/entities/Contact.entity';
import { IContact, saveContact } from '@domain/ports/IContact.interface';

@Injectable()
export class ContactRepository implements IContact {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async save(data: saveContact): Promise<Contact> {
    return await this.contactRepository.save(data);
  }

  async findById(id: string): Promise<Contact> {
    return await this.contactRepository.findOneByOrFail({ id });
  }
}