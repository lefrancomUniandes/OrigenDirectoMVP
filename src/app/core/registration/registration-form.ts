import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RegistrationForm {
  readonly open = signal(false);
}
