import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { Origin } from './origin';

@Injectable({ providedIn: 'root' })
export class OriginRepository extends DexieRepository<Origin> {
  constructor() {
    super(inject(OrigenDirectoDb).table('origenes'));
  }
}
