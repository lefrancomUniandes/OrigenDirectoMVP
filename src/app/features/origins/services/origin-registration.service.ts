import { Injectable, inject } from '@angular/core';
import { liveQuerySignal } from '../../../core/db/live-query';
import { SessionService } from '../../../core/session/session';
import { Origin } from '../data/origin';
import { OriginRepository } from '../data/origin.repository';

@Injectable({ providedIn: 'root' })
export class OriginRegistrationService {
  private readonly repo = inject(OriginRepository);
  private readonly session = inject(SessionService);

  readonly drafts = liveQuerySignal(async () => {
    const farmId = this.session.account()?.farmId ?? '';
    const rows = await this.repo.getAll();
    return rows.filter((row) => row.farmId === farmId && row.status === 'borrador');
  }, [] as Origin[]);

  readonly published = liveQuerySignal(async () => {
    const farmId = this.session.account()?.farmId ?? '';
    const rows = await this.repo.getAll();
    return rows.filter((row) => row.farmId === farmId && row.status === 'publicado');
  }, [] as Origin[]);

  saveDraft(name: string): Promise<string> {
    return this.repo.create({
      farmId: this.session.account()?.farmId ?? '',
      name: name.trim(),
      status: 'borrador',
      active: true,
      publishedOn: new Date().toISOString().slice(0, 10),
    });
  }

  publish(input: {
    name: string;
    variety: string;
    process: string;
    roast: string;
    altitude: number;
    notes: readonly string[];
    photo: string;
  }): Promise<string> {
    return this.repo.create({
      farmId: this.session.account()?.farmId ?? '',
      name: input.name.trim(),
      variety: input.variety,
      process: input.process,
      roast: input.roast,
      altitude: input.altitude,
      notes: input.notes,
      photo: input.photo,
      status: 'publicado',
      active: true,
      publishedOn: new Date().toISOString().slice(0, 10),
    });
  }

  setActive(id: string, active: boolean): Promise<void> {
    return this.repo.update(id, { active });
  }

  find(id: string): Promise<Origin | undefined> {
    return this.repo.getById(id);
  }

  saveChanges(id: string, name: string): Promise<void> {
    return this.repo.update(id, { name: name.trim() });
  }
}
