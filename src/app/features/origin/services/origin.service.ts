import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { seedDemoIfEmpty } from '../../../core/db/demo-seed';
import { liveQuerySignal } from '../../../core/db/live-query';
import { OriginFarm, OriginFarmRepository } from '../data/origin-farm.repository';
import { OriginLot, OriginLotRepository } from '../data/origin-lot.repository';

export interface OriginSheet {
  readonly lot: OriginLot;
  readonly farm: OriginFarm;
}

@Injectable()
export class OriginService {
  private readonly db = inject(OrigenDirectoDb);
  private readonly lots = inject(OriginLotRepository);
  private readonly farms = inject(OriginFarmRepository);
  private readonly lotId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  readonly sheet = liveQuerySignal(async () => {
    await seedDemoIfEmpty(this.db);
    const lot = await this.lots.getById(this.lotId);
    if (!lot?.active) {
      return null;
    }
    const farm = await this.farms.getById(lot.farmId);
    if (!farm) {
      return null;
    }
    return { lot, farm };
  }, undefined as OriginSheet | null | undefined);
}
