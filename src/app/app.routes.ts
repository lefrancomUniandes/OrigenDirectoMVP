import { Routes } from '@angular/router';
import { requireSession } from './core/session/session-guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/feed/routes').then((m) => m.routes),
      },
      {
        path: 'register',
        loadChildren: () => import('./features/farm-registration/routes').then((m) => m.routes),
      },
      {
        path: 'perfil',
        loadChildren: () => import('./features/profile/routes').then((m) => m.routes),
      },
      {
        path: 'mis-lotes',
        canActivate: [requireSession],
        loadChildren: () => import('./features/lots/routes').then((m) => m.routes),
      },
      {
        path: 'iniciar-sesion',
        loadChildren: () => import('./features/login/routes').then((m) => m.routes),
      },
    ],
  },
];
