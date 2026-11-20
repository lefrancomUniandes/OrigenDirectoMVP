import { Component, inject } from '@angular/core';
import { OriginRegistrationService } from '../services/origin-registration.service';

@Component({
  selector: 'app-origins-page',
  templateUrl: './origins-page.html',
})
export class OriginsPage {
  readonly origins = inject(OriginRegistrationService);
}
