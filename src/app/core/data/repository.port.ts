import { Observable } from 'rxjs';
import { Id } from './id';

export interface Entity {
  readonly id: Id;
}

/**
 * Contrato que debe cumplir cualquier origen de datos. Hoy lo implementa
 * `DexieRepository` sobre IndexedDB; cuando exista backend, una implementacion
 * HTTP puede ocupar su lugar sin tocar los servicios de las features.
 */
export interface CrudRepository<T extends Entity> {
  getAll(): Promise<T[]>;
  getById(id: Id): Promise<T | undefined>;
  /** Emite de nuevo ante cada cambio del almacen. Con HTTP seria polling o websocket. */
  watchAll(): Observable<T[]>;
  create(data: Omit<T, 'id'>): Promise<Id>;
  update(id: Id, changes: Partial<Omit<T, 'id'>>): Promise<void>;
  remove(id: Id): Promise<void>;
}
