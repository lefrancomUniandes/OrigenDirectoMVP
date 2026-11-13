import { Routes } from '@angular/router';
import { requireOwnFarm } from '../../core/session/session-guard';
import { ProfilePage } from './pages/profile-page';

export const routes: Routes = [
  {
    path: ':id/editar',
    component: ProfilePage,
    canActivate: [requireOwnFarm],
    data: { edit: true },
  },
  { path: ':id', component: ProfilePage },
];
