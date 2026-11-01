import { Injector, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

/**
 * Convierte una consulta de Dexie en un signal que se recalcula solo cuando
 * cambian los datos que la consulta toca. Es la forma estandar de leer datos
 * desde un servicio o componente:
 *
 * ```ts
 * protected readonly fincas = liveQuerySignal(() => this.repo.getAll(), []);
 * ```
 *
 * Debe llamarse dentro de un contexto de inyeccion, o recibir un `injector`.
 */
export function liveQuerySignal<T>(
  querier: () => T | Promise<T>,
  initialValue: T,
  options?: { injector?: Injector },
): Signal<T> {
  return toSignal(from(liveQuery(querier)), {
    initialValue,
    injector: options?.injector,
  });
}
