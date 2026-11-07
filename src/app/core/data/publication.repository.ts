import { Injectable, inject } from '@angular/core';
import { OrigenDirectoDb } from '../db/origen-directo.db';
import { DexieRepository } from './dexie.repository';
import { Entity } from './repository.port';

export interface PublicationPhoto {
  readonly type: string;
  readonly bytes: ArrayBuffer;
}

export interface Publication extends Entity {
  readonly farmId: string;
  readonly publishedOn: string;
  readonly text: string;
  readonly photo: PublicationPhoto | null;
}

@Injectable({ providedIn: 'root' })
export class PublicationRepository extends DexieRepository<Publication> {
  constructor() {
    super(inject(OrigenDirectoDb).table('publicaciones'));
  }
}
