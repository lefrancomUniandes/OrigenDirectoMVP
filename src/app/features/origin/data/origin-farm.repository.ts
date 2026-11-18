import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface OriginFarm extends Entity {
  readonly farmName: string;
  readonly ownerName: string;
  readonly department: string;
  readonly municipality: string;
  readonly village: string;
  readonly area: string;
  readonly areaUnit: string;
  readonly bio: string;
  readonly email: string;
  readonly mobile: string;
  readonly phoneAreaCode: string;
  readonly landline: string;
}

@Injectable({ providedIn: 'root' })
export class OriginFarmRepository extends DexieRepository<OriginFarm> {
  constructor() {
    super(inject(OrigenDirectoDb).table('fincas'));
  }
}
