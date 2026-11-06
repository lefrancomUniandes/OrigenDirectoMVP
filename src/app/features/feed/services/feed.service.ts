import { Injectable, inject } from '@angular/core';
import { liveQuerySignal } from '../../../core/db/live-query';
import { FeedFarm, FeedFarmRepository } from '../data/feed-farm.repository';
import { Novedad, NovedadRepository, SEEDED_NOVEDADES } from '../data/novedad.repository';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly farms = inject(FeedFarmRepository);
  private readonly novedadesRepo = inject(NovedadRepository);
  readonly items = liveQuerySignal(() => this.farms.getAll(), [] as FeedFarm[]);
  readonly novedades = liveQuerySignal(async () => {
    const rows = await this.novedadesRepo.getAll();
    return [...rows].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
  }, [] as Novedad[]);

  constructor() {
    void this.novedadesRepo.seedIfEmpty(SEEDED_NOVEDADES);
  }
}
