import { Component, inject } from '@angular/core';
import { OriginRegistrationService } from '../services/origin-registration.service';

@Component({
  selector: 'app-origins-page',
  templateUrl: './origins-page.html',
})
export class OriginsPage {
  readonly origins = inject(OriginRegistrationService);

  setActive(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    void this.origins.setActive(id, checked);
  }
}
