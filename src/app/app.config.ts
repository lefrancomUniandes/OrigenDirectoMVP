import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { OrigenDirectoDb } from './core/db/origen-directo.db';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Abrir la base al arrancar hace que los errores de esquema o migracion
    // aparezcan de inmediato y no en la primera consulta de una feature.
    provideAppInitializer(() => inject(OrigenDirectoDb).open()),
  ],
};
