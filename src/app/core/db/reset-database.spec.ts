import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { appConfig } from '../../app.config';
import { OrigenDirectoDb } from './origen-directo.db';
import { navigation } from './reset-database';
import { seedDemoIfEmpty } from './demo-seed';
import { installDemoAssets } from '../../../testing/demo-assets';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

describe('Reinicio de la base', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    history.replaceState(null, '', '/');
  });

  it('con datos ya guardados, abrir con reset deja solo el sembrado y la dirección ya no incluye reset', async () => {
    installDemoAssets();
    await Dexie.delete('origen-directo');
    const stale = new OrigenDirectoDb();
    await stale.open();
    await stale.table('fincas').add({ id: 'vieja', farmName: 'Finca Vieja' });
    stale.close();

    history.replaceState(null, '', '/?login=demo-paraiso&reset');
    vi.spyOn(navigation, 'replace').mockImplementation((next: string) => {
      history.replaceState(null, '', next);
    });

    await TestBed.configureTestingModule({ providers: [...appConfig.providers] }).compileComponents();
    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(String(vi.mocked(navigation.replace).mock.calls[0][0])).not.toContain('reset');
    expect(location.search).toContain('login=demo-paraiso');
    expect(location.search).not.toContain('reset');

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ providers: [...appConfig.providers] }).compileComponents();
    await TestBed.inject(ApplicationInitStatus).donePromise;

    const db = TestBed.inject(OrigenDirectoDb);
    await seedDemoIfEmpty(db);
    const farms = await db.table('fincas').toArray();
    const names = farms.map((row: { farmName: string }) => row.farmName);
    expect(names).toContain('Finca El Paraíso');
    expect(names).not.toContain('Finca Vieja');

    const varieties = (await db.table('lotes').toArray()).map((row: { variety: string }) => row.variety);
    expect(varieties).toEqual(expect.arrayContaining(['Caturra', 'Castillo', 'Tabi']));
    db.close();
  });
});
