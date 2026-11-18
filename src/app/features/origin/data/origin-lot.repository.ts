import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface OriginLot extends Entity {
  readonly farmId: string;
  readonly variety: string;
  readonly altitude: number;
  readonly status: string;
  readonly notes: string;
}

@Injectable({ providedIn: 'root' })
export class OriginLotRepository extends DexieRepository<OriginLot> {
  constructor() {
    super(inject(OrigenDirectoDb).table('lotes'));
  }
}
