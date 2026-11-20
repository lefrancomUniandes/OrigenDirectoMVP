import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface SheetOrigin extends Entity {
  readonly name: string;
  readonly process?: string;
  readonly roast?: string;
  readonly notes?: readonly string[];
}

@Injectable({ providedIn: 'root' })
export class SheetOriginRepository extends DexieRepository<SheetOrigin> {
  constructor() {
    super(inject(OrigenDirectoDb).table('origenes'));
  }
}
