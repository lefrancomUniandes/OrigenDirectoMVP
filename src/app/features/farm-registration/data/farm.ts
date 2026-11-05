import { Entity } from '../../../core/data/repository.port';

export interface FarmFile {
  readonly name: string;
  readonly type: string;
  readonly size: number;
}

export interface Farm extends Entity {
  readonly farmName: string;
  readonly department: string;
  readonly municipality: string;
  readonly village: string;
  readonly area: string;
  readonly areaUnit: string;
  readonly altitude: string;
  readonly varieties: readonly string[];
  readonly otherVariety: string;
  readonly ownerName: string;
  readonly documentType: string;
  readonly documentNumber: string;
  readonly email: string;
  readonly mobile: string;
  readonly phoneAreaCode: string;
  readonly landline: string;
  readonly bio: string;
  readonly experience: string;
  readonly photos: readonly FarmFile[];
  readonly pdf: FarmFile | null;
}
