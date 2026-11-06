import { Injectable, inject } from '@angular/core';
import { DexieRepository } from '../../../core/data/dexie.repository';
import { Entity } from '../../../core/data/repository.port';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';

export interface Novedad extends Entity {
  readonly title: string;
  readonly farmName: string;
  readonly municipality: string;
  readonly department: string;
  readonly publishedOn: string;
}

export const SEEDED_NOVEDADES: readonly Novedad[] = [
  {
    id: 'novedad-1',
    title: 'Lote 1 · Caturra Honey',
    farmName: 'Finca El Paraíso',
    municipality: 'Urrao',
    department: 'Antioquia',
    publishedOn: '2026-11-28',
  },
  {
    id: 'novedad-2',
    title: 'Lote 3 · Tabi Honey',
    farmName: 'Finca Alto de los Ángeles',
    municipality: 'Chinchiná',
    department: 'Caldas',
    publishedOn: '2026-11-27',
  },
  {
    id: 'novedad-3',
    title: 'Lote 2 · Tabi Anaeróbico',
    farmName: 'Finca La Fortuna',
    municipality: 'Planadas',
    department: 'Tolima',
    publishedOn: '2026-11-26',
  },
];

@Injectable({ providedIn: 'root' })
export class NovedadRepository extends DexieRepository<Novedad> {
  constructor() {
    super(inject(OrigenDirectoDb).table('novedades'));
  }

  async seedIfEmpty(rows: readonly Novedad[]): Promise<void> {
    if ((await this.table.count()) > 0) {
      return;
    }
    await this.table.bulkAdd([...rows]);
  }
}
