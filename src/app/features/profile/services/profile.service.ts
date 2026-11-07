import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Publication, PublicationRepository } from '../../../core/data/publication.repository';
import { liveQuerySignal } from '../../../core/db/live-query';
import { ProfileFarm, ProfileFarmRepository } from '../data/profile-farm.repository';

@Injectable()
export class ProfileService {
  private readonly route = inject(ActivatedRoute);
  private readonly farms = inject(ProfileFarmRepository);
  private readonly publications = inject(PublicationRepository);
  private readonly farmId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly canEdit = this.route.snapshot.queryParamMap.get('login') === this.farmId;
  readonly farm = liveQuerySignal(
    () => this.farms.getById(this.farmId),
    undefined as ProfileFarm | undefined,
  );
  readonly posts = liveQuerySignal(async () => {
    const rows = await this.publications.getAll();
    return rows.filter((row) => row.farmId === this.farmId);
  }, [] as Publication[]);
}
