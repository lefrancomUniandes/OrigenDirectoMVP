import { Injectable, inject } from '@angular/core';
import { OrigenDirectoDb } from '../db/origen-directo.db';
import { DexieRepository } from './dexie.repository';
import { Entity } from './repository.port';

export interface Novedad extends Entity {
  readonly lotId: string;
  readonly title: string;
  readonly farmName: string;
  readonly municipality: string;
  readonly department: string;
  readonly publishedOn: string;
}

@Injectable({ providedIn: 'root' })
export class NovedadRepository extends DexieRepository<Novedad> {
  constructor() {
    super(inject(OrigenDirectoDb).table('novedades'));
  }
}
