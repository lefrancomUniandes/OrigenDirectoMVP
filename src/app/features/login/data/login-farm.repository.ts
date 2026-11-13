import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface LoginAccount extends Entity {
  readonly email: string;
  readonly ownerName: string;
  readonly farmName: string;
  readonly passwordHash: string;
  readonly verified: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoginFarmRepository extends DexieRepository<LoginAccount> {
  constructor() {
    super(inject(OrigenDirectoDb).table('fincas'));
  }
}
