import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      // Cada feature aporta sus rutas y se carga bajo demanda:
      // {
      //   path: 'fincas',
      //   loadChildren: () => import('./features/fincas/routes').then((m) => m.routes),
      // },
    ],
  },
];
