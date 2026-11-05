import Dexie from 'dexie';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { FarmRepository } from './farm.repository';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

describe('FarmRepository', () => {
  it('guarda y recupera una finca por su id OD-año-######', async () => {
    TestBed.configureTestingModule({
      providers: [OrigenDirectoDb, FarmRepository],
    });
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('fincas').clear();
    const farms = TestBed.inject(FarmRepository);

    const photoFile = new File([new Uint8Array([1, 2, 3, 4])], 'finca.jpg', {
      type: 'image/jpeg',
    });
    const pdfFile = new File([new Uint8Array([5, 6, 7])], 'nit.pdf', {
      type: 'application/pdf',
    });
    const photo = {
      name: photoFile.name,
      type: photoFile.type,
      size: photoFile.size,
      bytes: await photoFile.arrayBuffer(),
    };
    const pdf = {
      name: pdfFile.name,
      type: pdfFile.type,
      size: pdfFile.size,
      bytes: await pdfFile.arrayBuffer(),
    };
    const id = await farms.create({
      id: 'OD-2026-123456',
      farmName: 'Finca La Esperanza',
      department: 'Huila',
      municipality: 'Pitalito',
      village: '',
      area: '12',
      areaUnit: 'Fanegadas',
      altitude: '1600',
      varieties: ['Castillo'],
      otherVariety: '',
      ownerName: 'Ana',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '123',
      email: 'ana@finca.com',
      mobile: '',
      phoneAreaCode: '',
      landline: '',
      bio: '',
      experience: '',
      photos: [photo],
      pdf,
    });
    const saved = await farms.getById(id);

    expect(id).toBe('OD-2026-123456');
    expect(saved?.farmName).toBe('Finca La Esperanza');
    expect(saved?.municipality).toBe('Pitalito');
    expect(saved?.ownerName).toBe('Ana');
    expect(saved?.photos[0]?.name).toBe('finca.jpg');
    expect([...new Uint8Array(saved!.photos[0].bytes)]).toEqual([1, 2, 3, 4]);
    expect(saved?.pdf?.name).toBe('nit.pdf');
    expect([...new Uint8Array(saved!.pdf!.bytes)]).toEqual([5, 6, 7]);
    db.close();
  });
});
