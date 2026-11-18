import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { routes } from '../../../app.routes';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { SessionService } from '../../../core/session/session';
import { Shell } from '../../../layout/shell/shell';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

describe('Página de la ficha pública', () => {
  let fixture: ComponentFixture<Shell>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('od.session');
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(OrigenDirectoDb).close();
  });

  async function open(url: string, marker = 'LOD-2026-001'): Promise<void> {
    fixture?.destroy();
    fixture = TestBed.createComponent(Shell);
    compiled = fixture.nativeElement as HTMLElement;
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    await untilText(marker);
  }

  async function untilText(text: string): Promise<void> {
    for (let attempt = 0; attempt < 40 && !compiled.textContent?.includes(text); attempt++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }
  }

  async function saveOrigin(
    photos: { type: string; bytes: ArrayBuffer }[] = [],
    notes = '',
  ): Promise<void> {
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('fincas').add({
      id: 'OD-2026-100001',
      farmName: 'Finca El Paraíso',
      department: 'Antioquia',
      municipality: 'Urrao',
      village: 'La Primavera',
      area: '4',
      areaUnit: 'Hectáreas',
      altitude: '1800',
      varieties: ['Castillo'],
      otherVariety: '',
      ownerName: 'Ana Morales',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '1234567890',
      email: 'ana@origendirecto.com',
      mobile: '3001111111',
      phoneAreaCode: '604',
      landline: '4442233',
      bio: 'Tercera generación cultivando café de altura.',
      experience: '',
      photos,
      pdf: null,
      passwordHash: 'hash',
      verified: true,
    });
    await db.table('lotes').add({
      id: 'LOD-2026-001',
      farmId: 'OD-2026-100001',
      quantity: 20,
      unit: 'sacos',
      variety: 'Castillo',
      altitude: 1800,
      price: 85000,
      status: 'Disponible',
      notes,
      active: true,
      publishedOn: '2026-10-01',
    });
  }

  it('sin sesión, el enlace de un lote activo muestra código, finca, productor, vereda, municipio, departamento, altitud, área, variedad, estado Disponible, contacto, biografía y el aviso de consulta pública', async () => {
    await saveOrigin();
    await open('/origen/lote/LOD-2026-001');

    expect(TestBed.inject(Router).url).toBe('/origen/lote/LOD-2026-001');
    expect(compiled.textContent).toContain('LOD-2026-001');
    expect(compiled.textContent).toContain('Finca El Paraíso');
    expect(compiled.textContent).toContain('Ana Morales');
    expect(compiled.textContent).toContain('La Primavera');
    expect(compiled.textContent).toContain('Urrao');
    expect(compiled.textContent).toContain('Antioquia');
    expect(compiled.textContent).toContain('1.800 m.s.n.m.');
    expect(compiled.textContent).toContain('4 Hectáreas');
    expect(compiled.textContent).toContain('Castillo');
    expect(compiled.textContent).toContain('Disponible');
    expect(compiled.textContent).toContain('3001111111');
    expect(compiled.textContent).toContain('604');
    expect(compiled.textContent).toContain('4442233');
    expect(compiled.textContent).toContain('ana@origendirecto.com');
    expect(compiled.textContent).toContain('Tercera generación cultivando café de altura.');
    expect(compiled.textContent).toContain('Consulta pública, no necesitas iniciar sesión');
    expect(compiled.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.google.com/maps?q=Urrao%2C%20Antioquia%2C%20Colombia&output=embed',
    );
  });

  it('con sesión iniciada, el mismo enlace sigue mostrando la ficha y no redirige al login', async () => {
    await saveOrigin();
    TestBed.inject(SessionService).start({
      farmId: 'OD-2026-100001',
      ownerName: 'Ana Morales',
      farmName: 'Finca El Paraíso',
    });
    await open('/origen/lote/LOD-2026-001');

    expect(TestBed.inject(Router).url).toBe('/origen/lote/LOD-2026-001');
    expect(compiled.textContent).toContain('LOD-2026-001');
    expect(compiled.textContent).toContain('Finca El Paraíso');
    expect(compiled.textContent).toContain('Consulta pública, no necesitas iniciar sesión');
  });

  it('cuando la finca tiene fotos, la ficha muestra la primera', async () => {
    const first = new Uint8Array([1, 2, 3, 4]).buffer;
    const second = new Uint8Array([9, 8, 7]).buffer;
    await saveOrigin([
      { type: 'image/jpeg', bytes: first },
      { type: 'image/png', bytes: second },
    ]);
    await open('/origen/lote/LOD-2026-001');

    const images = [...compiled.querySelectorAll('article img')];
    expect(images).toHaveLength(1);
    const shown = new Uint8Array(await (await fetch((images[0] as HTMLImageElement).src)).arrayBuffer());
    expect([...shown]).toEqual([1, 2, 3, 4]);
  });

  it('un lote En pausa y uno Vendido abren la ficha y muestran ese estado', async () => {
    await saveOrigin();
    await TestBed.inject(OrigenDirectoDb).table('lotes').bulkAdd([
      {
        id: 'lote-pausa',
        farmId: 'OD-2026-100001',
        quantity: 20,
        unit: 'sacos',
        variety: 'Castillo',
        altitude: 1800,
        price: 85000,
        status: 'En pausa',
        notes: '',
        active: true,
        publishedOn: '2026-10-01',
      },
      {
        id: 'lote-vendido',
        farmId: 'OD-2026-100001',
        quantity: 20,
        unit: 'sacos',
        variety: 'Castillo',
        altitude: 1800,
        price: 85000,
        status: 'Vendido',
        notes: '',
        active: true,
        publishedOn: '2026-10-01',
      },
    ]);

    await open('/origen/lote/lote-pausa', 'En pausa');
    expect(TestBed.inject(Router).url).toBe('/origen/lote/lote-pausa');
    expect(compiled.textContent).toContain('En pausa');
    expect(compiled.textContent).toContain('Consulta pública, no necesitas iniciar sesión');

    await open('/origen/lote/lote-vendido', 'Vendido');
    expect(TestBed.inject(Router).url).toBe('/origen/lote/lote-vendido');
    expect(compiled.textContent).toContain('Vendido');
    expect(compiled.textContent).toContain('Consulta pública, no necesitas iniciar sesión');
  });

  it('con notas de cata, la ficha muestra ese texto', async () => {
    await saveOrigin([], 'Panela, cacao y frutos rojos.');
    await open('/origen/lote/LOD-2026-001');

    expect(compiled.textContent).toContain('Panela, cacao y frutos rojos.');
  });

  it('sin notas de cata, la ficha no muestra el bloque de notas', async () => {
    await saveOrigin();
    await open('/origen/lote/LOD-2026-001');

    expect(compiled.querySelector('[aria-label="Notas de cata"]')).toBeNull();
  });

  it('si el enlace no corresponde a un lote, se ve «Esta ficha no está disponible» y volver al inicio lleva al feed', async () => {
    await saveOrigin();
    await open('/origen/lote/no-existe', 'Esta ficha no está disponible');

    expect(compiled.textContent).toContain('Esta ficha no está disponible');
    expect(compiled.textContent).toContain('El lote puede estar inactivo o el código ya no es válido.');
    expect(compiled.textContent).not.toContain('LOD-2026-001');

    const back = [...compiled.querySelectorAll('a')].find((el) => el.textContent?.includes('Volver al inicio'));
    back?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
