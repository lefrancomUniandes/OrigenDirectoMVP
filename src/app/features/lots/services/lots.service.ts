import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NovedadRepository } from '../../../core/data/novedad.repository';
import { liveQuerySignal } from '../../../core/db/live-query';
import { Lot } from '../data/lot';
import { LotFarm, LotFarmRepository } from '../data/lot-farm.repository';
import { LotRepository } from '../data/lot.repository';
import { LotWrite } from './lot-form';

@Injectable()
export class LotsService {
  private readonly route = inject(ActivatedRoute);
  private readonly lotsRepo = inject(LotRepository);
  private readonly farms = inject(LotFarmRepository);
  private readonly novedades = inject(NovedadRepository);
  private readonly farmId = this.route.snapshot.queryParamMap.get('login') ?? '';

  readonly farm = liveQuerySignal(
    () => this.farms.getById(this.farmId),
    undefined as LotFarm | undefined,
  );

  readonly lots = liveQuerySignal(async () => {
    const rows = await this.lotsRepo.getAll();
    return rows.filter((row) => row.farmId === this.farmId && row.active);
  }, [] as Lot[]);

  async publish(input: LotWrite): Promise<void> {
    const publishedOn = new Date().toISOString();
    const id = await this.lotsRepo.create({
      ...input,
      farmId: this.farmId,
      status: 'Disponible',
      active: true,
      publishedOn,
    });
    const farm = await this.farms.getById(this.farmId);
    await this.novedades.create({
      lotId: id,
      title: input.variety,
      farmName: farm?.farmName ?? '',
      municipality: farm?.municipality ?? '',
      department: farm?.department ?? '',
      publishedOn,
    });
  }

  async save(id: string, input: LotWrite): Promise<void> {
    await this.lotsRepo.update(id, input);
    const match = (await this.novedades.getAll()).find((row) => row.lotId === id);
    if (match) {
      await this.novedades.update(match.id, { title: input.variety });
    }
  }

  async deactivate(id: string): Promise<void> {
    await this.lotsRepo.update(id, { active: false });
    const match = (await this.novedades.getAll()).find((row) => row.lotId === id);
    if (match) {
      await this.novedades.remove(match.id);
    }
  }
}
