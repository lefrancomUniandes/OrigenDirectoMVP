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

  setActive(id: string, active: boolean): Promise<void> {
    return this.repo.update(id, { active });
  }
}
