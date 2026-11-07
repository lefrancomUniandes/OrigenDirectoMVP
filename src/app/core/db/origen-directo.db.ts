import { Injectable } from '@angular/core';
import Dexie from 'dexie';

/**
 * Base de datos local de la aplicacion (IndexedDB).
 *
 * Cada feature declara aqui su tabla, con la propiedad tipada y el indice
 * correspondiente:
 *
 * ```ts
 * declare fincas: Table<Finca, Id>;
 * // ...
 * this.version(2).stores({ fincas: 'id, municipio, creadoEn' });
 * ```
 *
 * Para cambiar el esquema se agrega una nueva llamada a `version(n).stores(...)`
 * sin modificar las anteriores: Dexie las aplica en orden y migra los datos que
 * el usuario ya tenga guardados en su navegador.
 */
@Injectable({ providedIn: 'root' })
export class OrigenDirectoDb extends Dexie {
  constructor() {
    // The default cache clones each result and rebuilds ArrayBuffers without
    // their bytes. Immutable keeps the photo bytes that IndexedDB returns.
    super('origen-directo', { cache: 'immutable' });

    this.version(1).stores({});
    this.version(2).stores({ fincas: 'id, farmName' });
    this.version(3).stores({
      fincas: 'id, farmName',
      novedades: 'id, publishedOn',
    });
    this.version(4).stores({
      fincas: 'id, farmName',
      novedades: 'id, publishedOn',
      publicaciones: 'id, farmId, publishedOn',
    });
    this.version(5).stores({
      fincas: 'id, farmName',
      novedades: 'id, publishedOn, lotId',
      publicaciones: 'id, farmId, publishedOn',
      lotes: 'id, farmId',
    });
  }
}
