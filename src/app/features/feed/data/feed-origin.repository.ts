import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface FeedOrigin extends Entity {
  readonly name: string;
  readonly status: string;
  readonly active: boolean;
}

@Injectable({ providedIn: 'root' })
export class FeedOriginRepository extends DexieRepository<FeedOrigin> {
  constructor() {
    super(inject(OrigenDirectoDb).table('origenes'));
  }
}
