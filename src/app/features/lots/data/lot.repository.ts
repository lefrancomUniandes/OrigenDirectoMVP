import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { Lot } from './lot';

@Injectable({ providedIn: 'root' })
export class LotRepository extends DexieRepository<Lot> {
  constructor() {
    super(inject(OrigenDirectoDb).table('lotes'));
  }
}
