import {
  ApplicationConfig,
  inject,
  Injector,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  runInInjectionContext,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { OrigenDirectoDb } from './core/db/origen-directo.db';
import { resetDatabaseIfRequested } from './core/db/reset-database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Abrir la base al arrancar hace que los errores de esquema o migracion
    // aparezcan de inmediato y no en la primera consulta de una feature.
    provideAppInitializer(() => {
      const injector = inject(Injector);
      return (async () => {
        if (await resetDatabaseIfRequested()) {
          return;
        }
        await runInInjectionContext(injector, () => inject(OrigenDirectoDb)).open();
      })();
    }),
  ],
};
