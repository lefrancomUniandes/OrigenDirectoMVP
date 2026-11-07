import { Entity } from '../../../core/data/repository.port';

export type LotUnit = 'kg' | 'sacos';
export type LotStatus = 'Disponible' | 'En pausa' | 'Vendido';

export interface Lot extends Entity {
  readonly farmId: string;
  readonly quantity: number;
  readonly unit: LotUnit;
  readonly variety: string;
  readonly altitude: number;
  readonly price: number;
  readonly status: LotStatus;
  readonly notes: string;
  readonly active: boolean;
  readonly publishedOn: string;
}
