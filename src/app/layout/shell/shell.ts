import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { RegistrationForm } from '../../core/registration/registration-form';
import { SessionService } from '../../core/session/session';
import { FarmRegistrationWizard } from '../../features/farm-registration/components/farm-registration-wizard';

@Component({
  imports: [RouterLink, RouterOutlet, FarmRegistrationWizard],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  private readonly router = inject(Router);
  readonly form = inject(RegistrationForm);
  readonly session = inject(SessionService);
  readonly signedIn = this.session.signedIn;
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  logOut(): void {
    this.session.end();
    this.menuOpen.set(false);
    void this.router.navigateByUrl('/');
  }
}
