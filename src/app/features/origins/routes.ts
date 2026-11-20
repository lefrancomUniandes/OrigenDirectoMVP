import { Routes } from '@angular/router';
import { OriginRegistrationPage } from './pages/origin-registration-page';
import { OriginsPage } from './pages/origins-page';

export const routes: Routes = [
  { path: '', component: OriginsPage },
  { path: 'registrar', component: OriginRegistrationPage },
];
