import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { routes } from '../../../app.routes';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
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

  async function open(url: string): Promise<void> {
    fixture = TestBed.createComponent(Shell);
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    await untilText('LOD-2026-001');
  }

  async function untilText(text: string): Promise<void> {
    for (let attempt = 0; attempt < 40 && !compiled.textContent?.includes(text); attempt++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }
  }

  async function saveOrigin(): Promise<void> {
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
      photos: [],
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
      notes: '',
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
});
