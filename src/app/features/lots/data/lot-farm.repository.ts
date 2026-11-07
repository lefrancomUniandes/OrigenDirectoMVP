import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface LotFarm extends Entity {
  readonly farmName: string;
  readonly municipality: string;
  readonly department: string;
}

@Injectable({ providedIn: 'root' })
export class LotFarmRepository extends DexieRepository<LotFarm> {
  constructor() {
    super(inject(OrigenDirectoDb).table('fincas'));
  }
}
