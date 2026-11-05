import { Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { FarmRegistrationWizard } from '../../features/farm-registration/components/farm-registration-wizard';

@Component({
  imports: [MatToolbarModule, RouterOutlet, FarmRegistrationWizard],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  readonly formOpen = signal(false);
}
