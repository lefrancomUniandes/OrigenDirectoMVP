import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Publication, PublicationRepository } from '../../../core/data/publication.repository';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { seedDemoIfEmpty } from '../../../core/db/demo-seed';
import { liveQuerySignal } from '../../../core/db/live-query';
import { SessionService } from '../../../core/session/session';
import { ProfileFarm, ProfileFarmRepository } from '../data/profile-farm.repository';

@Injectable()
export class ProfileService {
  private readonly route = inject(ActivatedRoute);
  private readonly farms = inject(ProfileFarmRepository);
  private readonly publications = inject(PublicationRepository);
  private readonly farmId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly canEdit = inject(SessionService).account()?.farmId === this.farmId;

  constructor() {
    void seedDemoIfEmpty(inject(OrigenDirectoDb));
  }
  readonly farm = liveQuerySignal(
    () => this.farms.getById(this.farmId),
    undefined as ProfileFarm | undefined,
  );
  readonly posts = liveQuerySignal(async () => {
    const rows = await this.publications.getAll();
    return rows.filter((row) => row.farmId === this.farmId);
  }, [] as Publication[]);

  async update(changes: Partial<Omit<ProfileFarm, 'id'>>): Promise<void> {
    const current = await this.farms.getById(this.farmId);
    if (current) {
      const previous = `${current.bio}\n${current.email}\n${current.mobile}\n${current.landline}`;
      const next = `${changes.bio ?? current.bio}\n${changes.email ?? current.email}\n${changes.mobile ?? current.mobile}\n${changes.landline ?? current.landline}`;
      const presentation = (await this.publications.getAll()).find(
        (row) => row.farmId === this.farmId && row.photo === null && row.text === previous,
      );
      if (presentation) {
        await this.publications.update(presentation.id, { text: next });
      }
    }
    await this.farms.update(this.farmId, changes);
  }
}
