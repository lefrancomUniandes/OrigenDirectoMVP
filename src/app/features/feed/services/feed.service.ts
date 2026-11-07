import { Injectable, inject } from '@angular/core';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { seedDemoIfEmpty } from '../../../core/db/demo-seed';
import { liveQuerySignal } from '../../../core/db/live-query';
import { Novedad, NovedadRepository } from '../../../core/data/novedad.repository';
import { FeedFarm, FeedFarmRepository } from '../data/feed-farm.repository';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly farms = inject(FeedFarmRepository);
  private readonly novedadesRepo = inject(NovedadRepository);
  readonly items = liveQuerySignal(() => this.farms.getAll(), [] as FeedFarm[]);
  readonly novedades = liveQuerySignal(async () => {
    const rows = await this.novedadesRepo.getAll();
    return [...rows].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)).slice(0, 15);
  }, [] as Novedad[]);

  constructor() {
    void seedDemoIfEmpty(inject(OrigenDirectoDb));
  }
}
