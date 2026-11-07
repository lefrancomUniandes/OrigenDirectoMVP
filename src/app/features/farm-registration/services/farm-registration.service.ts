import { Injectable } from '@angular/core';
import { Id } from '../../../core/data/id';
import { PublicationRepository } from '../../../core/data/publication.repository';
import { FarmRepository } from '../data/farm.repository';
import { Farm } from '../data/farm';

@Injectable({ providedIn: 'root' })
export class FarmRegistrationService {
  constructor(
    private readonly farms: FarmRepository,
    private readonly publications: PublicationRepository,
  ) {}

  async register(draft: Omit<Farm, 'id'>): Promise<Id> {
    const serial = String(Math.floor(Math.random() * 900000) + 100000);
    const id = `OD-${new Date().getFullYear()}-${serial}`;
    await this.farms.create({ ...draft, id });
    const publishedOn = new Date().toISOString().slice(0, 10);
    for (const photo of draft.photos) {
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
      text: `${draft.bio}\n${draft.email}\n${draft.mobile}\n${draft.landline}`,
      photo: null,
    });
    return id;
  }
}
