import { Component, inject } from '@angular/core';
import { OriginCard } from '../../../shared/ui/origin-card';
import { OriginRegistrationService } from '../services/origin-registration.service';

@Component({
  selector: 'app-origins-page',
  imports: [OriginCard],
  templateUrl: './origins-page.html',
  styleUrl: './origins-page.scss',
})
export class OriginsPage {
  readonly origins = inject(OriginRegistrationService);

  setActive(id: string, active: boolean): void {
    void this.origins.setActive(id, active);
  }
}
