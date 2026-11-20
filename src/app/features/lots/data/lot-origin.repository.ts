import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface LotOrigin extends Entity {
  readonly farmId: string;
  readonly name: string;
  readonly status: string;
  readonly active: boolean;
}

@Injectable({ providedIn: 'root' })
export class LotOriginRepository extends DexieRepository<LotOrigin> {
  constructor() {
    super(inject(OrigenDirectoDb).table('origenes'));
  }
}
