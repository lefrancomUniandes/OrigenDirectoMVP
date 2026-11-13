import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session';

function loginRedirect(returnUrl: string) {
  return inject(Router).createUrlTree(['/iniciar-sesion'], {
    queryParams: { returnUrl },
  });
}

export const requireSession: CanActivateFn = (_route, state) => {
  if (inject(SessionService).signedIn()) {
    return true;
  }
  return loginRedirect(state.url);
};

export const requireOwnFarm: CanActivateFn = (route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (!session.signedIn()) {
    return loginRedirect(state.url);
  }
  const id = route.paramMap.get('id');
  if (session.account()?.farmId !== id) {
    return router.createUrlTree(['/perfil', id]);
  }
  return true;
};
