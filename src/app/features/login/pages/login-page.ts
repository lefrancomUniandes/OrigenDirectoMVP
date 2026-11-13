import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationForm } from '../../../core/registration/registration-form';
import { LoginService } from '../services/login.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly login = inject(LoginService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly registration = inject(RegistrationForm);

  readonly email = signal('');
  readonly password = signal('');
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);
  readonly passwordVisible = signal(false);
  readonly forgot = signal(false);
  readonly notice = signal('');

  readonly emailError = computed(() => {
    if (!this.emailTouched()) {
      return '';
    }
    const value = this.email().trim();
    if (value === '') {
      return 'Ingresa tu correo electrónico';
    }
    if (value.length > 120) {
      return 'El correo no puede superar 120 caracteres';
    }
    if (!EMAIL_PATTERN.test(value)) {
      return 'Ingresa un correo válido';
    }
    return '';
  });

  readonly passwordError = computed(() => {
    if (!this.passwordTouched()) {
      return '';
    }
    return this.password() === '' ? 'Ingresa tu contraseña' : '';
  });

  readonly canSubmit = computed(() => {
    const value = this.email().trim();
    return value !== '' && value.length <= 120 && EMAIL_PATTERN.test(value) && this.password() !== '';
  });

  onEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.notice.set('');
  }

  onPassword(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
    this.notice.set('');
  }

  openRegistration(): void {
    this.registration.open.set(true);
  }

  async enter(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }
    this.notice.set('');
    const result = await this.login.signIn(this.email(), this.password());
    if (result.kind === 'success') {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const target =
        returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/mis-lotes';
      await this.router.navigateByUrl(target);
      return;
    }
    this.notice.set(
      result.kind === 'locked'
        ? 'Cuenta bloqueada temporalmente. Por seguridad bloqueamos el acceso durante 15 minutos.'
        : 'Correo o contraseña incorrectos',
    );
  }
}
