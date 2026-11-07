import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { FarmRegistrationWizard } from '../../features/farm-registration/components/farm-registration-wizard';
import { RegistrationForm } from '../../features/farm-registration/services/registration-form';

@Component({
  imports: [RouterLink, RouterOutlet, FarmRegistrationWizard],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  private readonly route = inject(ActivatedRoute);
  readonly form = inject(RegistrationForm);
  readonly signedIn = toSignal(
    this.route.queryParamMap.pipe(map((params) => !!params.get('login'))),
    { initialValue: !!this.route.snapshot.queryParamMap.get('login') },
  );
}
