import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FarmRegistrationWizard } from '../../features/farm-registration/components/farm-registration-wizard';
import { RegistrationForm } from '../../features/farm-registration/services/registration-form';

@Component({
  imports: [RouterLink, RouterOutlet, FarmRegistrationWizard],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  readonly form = inject(RegistrationForm);
}
