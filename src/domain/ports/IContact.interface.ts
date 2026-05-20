import type { Contact } from '@domain/entities/Contact.entity';

export interface IContact {
  save(data: saveContact): Promise<Contact>;
  findById(id: string): Promise<Contact>;
}

type baseOmit = 'created_at' | 'updated_at' | 'id' | 'deleted_at';

export type saveContact = Partial<Omit<Contact, baseOmit>>;
