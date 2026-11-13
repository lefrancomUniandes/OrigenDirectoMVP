import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { RegistrationForm } from '../../core/registration/registration-form';
import { SessionPortrait } from '../../core/session/session-portrait';
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
  private readonly portrait = inject(SessionPortrait);
  readonly signedIn = this.session.signedIn;
  readonly menuOpen = signal(false);
  readonly portraitUrl = signal('');
  private objectUrl = '';
  readonly initials = computed(() => {
    const parts = (this.session.account()?.ownerName ?? '').trim().split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });

  constructor() {
    effect(() => {
      const photo = this.portrait.photo();
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = '';
      }
      if (!photo) {
        this.portraitUrl.set('');
        return;
      }
      const copy = new Uint8Array(photo.bytes);
      this.objectUrl = URL.createObjectURL(new Blob([copy], { type: photo.type }));
      this.portraitUrl.set(this.objectUrl);
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  logOut(): void {
    this.session.end();
    this.menuOpen.set(false);
    void this.router.navigateByUrl('/');
  }
}
