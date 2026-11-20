import { Entity } from '../../../core/data/repository.port';

export type OriginStatus = 'borrador' | 'publicado';

export interface Origin extends Entity {
  readonly farmId: string;
  readonly name: string;
  readonly status: OriginStatus;
  readonly publishedOn: string;
}
