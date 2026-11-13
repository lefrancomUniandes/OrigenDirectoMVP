import { Injectable } from '@angular/core';
import { hashPassword } from '../../../core/auth/password-hash';
import { Id } from '../../../core/data/id';
import { PublicationRepository } from '../../../core/data/publication.repository';
import { FarmRepository } from '../data/farm.repository';
import { Farm } from '../data/farm';

export type RegistrationDraft = Omit<Farm, 'id' | 'passwordHash' | 'verified'> & {
  password?: string;
};

@Injectable({ providedIn: 'root' })
export class FarmRegistrationService {
  constructor(
    private readonly farms: FarmRepository,
    private readonly publications: PublicationRepository,
  ) {}

  async register(draft: RegistrationDraft): Promise<Id> {
    const serial = String(Math.floor(Math.random() * 900000) + 100000);
    const id = `OD-${new Date().getFullYear()}-${serial}`;
    const { password, ...rest } = draft;
    const passwordHash = password ? await hashPassword(password) : '';
    await this.farms.create({ ...rest, passwordHash, verified: true, id });
    const publishedOn = new Date().toISOString().slice(0, 10);
    for (const photo of rest.photos) {
      await this.publications.create({
        farmId: id,
        publishedOn,
        text: '',
        photo: { type: photo.type, bytes: photo.bytes },
      });
    }
    await this.publications.create({
      farmId: id,
      publishedOn,
      text: `${rest.bio}\n${rest.email}\n${rest.mobile}\n${rest.landline}`,
      photo: null,
    });
    return id;
  }
}
