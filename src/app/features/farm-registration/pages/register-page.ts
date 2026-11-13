import { Component, inject } from '@angular/core';
import { RegistrationForm } from '../../../core/registration/registration-form';

@Component({
  selector: 'app-register-page',
  styleUrl: './register-page.scss',
  templateUrl: './register-page.html',
})
export class RegisterPage {
  readonly form = inject(RegistrationForm);
}
