import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Id } from '../../../core/data/id';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { Farm } from './farm';

@Injectable({ providedIn: 'root' })
export class FarmRepository extends DexieRepository<Farm> {
  constructor() {
    super(inject(OrigenDirectoDb).table('fincas'));
  }

  override async create(data: Omit<Farm, 'id'> | Farm): Promise<Id> {
    const id = 'id' in data ? data.id : undefined;
    if (id) {
      await this.table.add({ ...data, id } as Farm);
      return id;
    }
    return super.create(data);
  }
}
