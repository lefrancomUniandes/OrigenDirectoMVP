import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface FeedPhoto {
  readonly type: string;
  readonly bytes: ArrayBuffer;
}

export interface FeedFarm extends Entity {
  readonly farmName: string;
  readonly municipality: string;
  readonly department: string;
  readonly bio: string;
  readonly photos: readonly FeedPhoto[];
}

@Injectable({ providedIn: 'root' })
export class FeedFarmRepository extends DexieRepository<FeedFarm> {
  constructor() {
    super(inject(OrigenDirectoDb).table('fincas'));
  }
}
