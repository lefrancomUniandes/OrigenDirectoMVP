import { liveQuery, Table, UpdateSpec } from 'dexie';
import { from, Observable } from 'rxjs';
import { Id, newId } from './id';
import { CrudRepository, Entity } from './repository.port';

/**
 * Implementacion generica del repositorio sobre una tabla de Dexie. Cada feature
 * crea su repositorio extendiendo esta clase y pasandole su tabla:
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class FincaRepository extends DexieRepository<Finca> {
 *   constructor() {
 *     super(inject(OrigenDirectoDb).fincas);
 *   }
 * }
 * ```
 */
export abstract class DexieRepository<T extends Entity> implements CrudRepository<T> {
  protected constructor(protected readonly table: Table<T, Id>) {}

  getAll(): Promise<T[]> {
    return this.table.toArray();
  }

  getById(id: Id): Promise<T | undefined> {
    return this.table.get(id);
  }

  watchAll(): Observable<T[]> {
    return from(liveQuery(() => this.table.toArray()));
  }

  async create(data: Omit<T, 'id'>): Promise<Id> {
    const entity = { ...data, id: newId() } as unknown as T;
    await this.table.add(entity);
    return entity.id;
  }

  async update(id: Id, changes: Partial<Omit<T, 'id'>>): Promise<void> {
    await this.table.update(id, changes as unknown as UpdateSpec<T>);
  }

  async remove(id: Id): Promise<void> {
    await this.table.delete(id);
  }
}
