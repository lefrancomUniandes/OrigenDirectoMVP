import { Injectable } from '@angular/core';
import { Id } from '../../../core/data/id';
import { FarmRepository } from '../data/farm.repository';
import { Farm } from '../data/farm';

@Injectable({ providedIn: 'root' })
export class FarmRegistrationService {
  constructor(private readonly farms: FarmRepository) {}

  async register(draft: Omit<Farm, 'id'>): Promise<Id> {
    const serial = String(Math.floor(Math.random() * 900000) + 100000);
    const id = `OD-${new Date().getFullYear()}-${serial}`;
    await this.farms.create({ ...draft, id });
    return id;
  }
}
