import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface ProfilePhoto {
  readonly type: string;
  readonly bytes: ArrayBuffer;
}

export interface ProfileFarm extends Entity {
  readonly farmName: string;
  readonly ownerName: string;
  readonly municipality: string;
  readonly department: string;
  readonly village: string;
  readonly area: string;
  readonly areaUnit: string;
  readonly altitude: string;
  readonly varieties: readonly string[];
  readonly otherVariety: string;
  readonly bio: string;
  readonly experience: string;
  readonly email: string;
  readonly mobile: string;
  readonly phoneAreaCode: string;
  readonly landline: string;
  readonly photos: readonly ProfilePhoto[];
}

@Injectable({ providedIn: 'root' })
export class ProfileFarmRepository extends DexieRepository<ProfileFarm> {
  constructor() {
    super(inject(OrigenDirectoDb).table('fincas'));
  }
}
