import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface OriginFarm extends Entity {
  readonly farmName: string;
  readonly department: string;
}

@Injectable({ providedIn: 'root' })
export class OriginFarmRepository extends DexieRepository<OriginFarm> {
  constructor() {
    super(inject(OrigenDirectoDb).table('fincas'));
  }
}
