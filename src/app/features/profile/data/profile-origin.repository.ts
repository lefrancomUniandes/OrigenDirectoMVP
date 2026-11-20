import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface ProfileOrigin extends Entity {
  readonly farmId: string;
  readonly name: string;
  readonly status: string;
  readonly active: boolean;
  readonly publishedOn: string;
  readonly variety: string;
  readonly process: string;
  readonly roast: string;
  readonly altitude: number;
  readonly notes: readonly string[];
  readonly photo: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileOriginRepository extends DexieRepository<ProfileOrigin> {
  constructor() {
    super(inject(OrigenDirectoDb).table('origenes'));
  }
}
