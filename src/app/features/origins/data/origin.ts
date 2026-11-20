import { Entity } from '../../../core/data/repository.port';

export type OriginStatus = 'borrador' | 'publicado';

export interface Origin extends Entity {
  readonly farmId: string;
  readonly name: string;
  readonly status: OriginStatus;
  readonly active: boolean;
  readonly publishedOn: string;
  readonly variety?: string;
  readonly process?: string;
  readonly roast?: string;
  readonly altitude?: number;
  readonly notes?: readonly string[];
  readonly photo?: string;
}
