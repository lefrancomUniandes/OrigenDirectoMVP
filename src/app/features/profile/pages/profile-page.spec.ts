import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { ProfilePage } from './profile-page';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

describe('Página del perfil', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let compiled: HTMLElement;
  let login = '';

  beforeEach(async () => {
    login = '';
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'OD-2026-100001' }),
              get queryParamMap() {
                return convertToParamMap(login ? { login } : {});
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(OrigenDirectoDb).close();
  });

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  }

  async function saveFarm(): Promise<void> {
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('fincas').add({
      id: 'OD-2026-100001',
      farmName: 'Finca La Esperanza',
      department: 'Huila',
      municipality: 'Pitalito',
      village: 'El Carmelo',
      area: '3',
      areaUnit: 'Hectáreas',
      altitude: '1800',
      varieties: ['Castillo', 'Caturra'],
      otherVariety: 'Gesha',
      ownerName: 'Ana Morales',
      documentType: '',
      documentNumber: '',
      email: 'ana@finca.com',
      mobile: '3001234567',
      phoneAreaCode: '608',
      landline: '8765432',
      bio: 'Café de altura cultivado bajo sombra.',
      experience: '15',
      photos: [{ type: 'image/jpeg', bytes: new Uint8Array([4, 5, 6]).buffer }],
      pdf: null,
    });
  }

  it('muestra el nombre de la finca, el del caficultor, «Pitalito, Huila», la biografía, los años de experiencia y «Contactar por WhatsApp»', async () => {
    await saveFarm();
    await render();

    const whatsapp = compiled.querySelector('a');

    expect(compiled.textContent).toContain('Finca La Esperanza');
    expect(compiled.textContent).toContain('Ana Morales');
    expect(compiled.textContent).toContain('Pitalito, Huila');
    expect(compiled.textContent).toContain('Café de altura cultivado bajo sombra.');
    expect(compiled.textContent).toContain('15');
    expect(whatsapp?.textContent).toContain('Contactar por WhatsApp');
    expect(whatsapp?.getAttribute('href')).toBe('https://wa.me/3001234567');
    expect(whatsapp?.getAttribute('target')).toBe('_blank');
  });

  it('«La finca» muestra foto, nombre, altitud, vereda, área con unidad, variedades, otra variedad, correo, celular, indicativo y fijo', async () => {
    await saveFarm();
    await render();

    const section = compiled.querySelector('[aria-label="La finca"]') as HTMLElement;
    const img = section.querySelector('img');
    const shown = new Uint8Array(await (await fetch(img!.src)).arrayBuffer());

    expect(section.textContent).toContain('La finca');
    expect(section.textContent).toContain('Finca La Esperanza');
    expect(section.textContent).toContain('1800');
    expect(section.textContent).toContain('El Carmelo');
    expect(section.textContent).toContain('3 Hectáreas');
    expect(section.textContent).toContain('Castillo');
    expect(section.textContent).toContain('Caturra');
    expect(section.textContent).toContain('Gesha');
    expect(section.textContent).toContain('ana@finca.com');
    expect(section.textContent).toContain('3001234567');
    expect(section.textContent).toContain('608');
    expect(section.textContent).toContain('8765432');
    expect([...shown]).toEqual([4, 5, 6]);
  });

  it('la galería muestra solo las publicaciones de esa finca', async () => {
    await saveFarm();
    const db = TestBed.inject(OrigenDirectoDb);
    await db.table('publicaciones').bulkAdd([
      {
        id: 'pub-1',
        farmId: 'OD-2026-100001',
        publishedOn: '2026-11-01',
        text: 'Fermentación en cereza',
        photo: null,
      },
      {
        id: 'pub-2',
        farmId: 'OD-2026-100001',
        publishedOn: '2026-11-02',
        text: 'Recolección de la mañana',
        photo: null,
      },
      {
        id: 'pub-otra',
        farmId: 'OD-2026-999999',
        publishedOn: '2026-11-03',
        text: 'Secado en marquesina',
        photo: null,
      },
    ]);

    await render();

    const gallery = compiled.querySelector('[aria-label="Publicaciones"]') as HTMLElement;

    expect(gallery.textContent).toContain('Fermentación en cereza');
    expect(gallery.textContent).toContain('Recolección de la mañana');
    expect(gallery.textContent).not.toContain('Secado en marquesina');
  });

  it('al abrir una publicación se ven la foto, la fecha y el texto', async () => {
    await saveFarm();
    const db = TestBed.inject(OrigenDirectoDb);
    await db.table('publicaciones').add({
      id: 'pub-foto',
      farmId: 'OD-2026-100001',
      publishedOn: '2026-11-02',
      text: 'Recolección de la mañana',
      photo: { type: 'image/jpeg', bytes: new Uint8Array([7, 8, 9]).buffer },
    });

    await render();

    const opener = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Recolección de la mañana'),
    );
    opener!.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const img = dialog.querySelector('img');
    const shown = new Uint8Array(await (await fetch(img!.src)).arrayBuffer());

    expect(dialog.textContent).toContain('Recolección de la mañana');
    expect(dialog.textContent).toContain('2026-11-02');
    expect([...shown]).toEqual([7, 8, 9]);
  });

  it('el corazón muestra el aviso «Trabajo en progreso»', async () => {
    await saveFarm();
    const db = TestBed.inject(OrigenDirectoDb);
    await db.table('publicaciones').add({
      id: 'pub-foto',
      farmId: 'OD-2026-100001',
      publishedOn: '2026-11-02',
      text: 'Recolección de la mañana',
      photo: null,
    });

    await render();

    const opener = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Recolección de la mañana'),
    );
    opener!.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const heart = [...dialog.querySelectorAll('button')].find(
      (button) => button.getAttribute('aria-label') === 'Me gusta',
    );
    heart!.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Trabajo en progreso');
  });

  it('sin login, o con el de otra finca, no está «Editar perfil»', async () => {
    await saveFarm();
    await render();

    expect(compiled.textContent).not.toContain('Editar perfil');

    login = 'OD-2026-999999';
    await render();

    expect(compiled.textContent).not.toContain('Editar perfil');
  });

  it('con login de esa finca, «Editar perfil» abre los datos actuales', async () => {
    login = 'OD-2026-100001';
    await saveFarm();
    await render();

    const edit = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Editar perfil'),
    );
    edit!.click();
    fixture.detectChanges();

    const value = (selector: string) =>
      (compiled.querySelector(selector) as HTMLInputElement).value;

    expect(value('#farmName')).toBe('Finca La Esperanza');
    expect(value('#ownerName')).toBe('Ana Morales');
    expect(value('#municipality')).toBe('Pitalito');
    expect(value('#department')).toBe('Huila');
    expect(value('#bio')).toBe('Café de altura cultivado bajo sombra.');
    expect(value('#experience')).toBe('15');
    expect(value('#mobile')).toBe('3001234567');
    expect(value('#village')).toBe('El Carmelo');
    expect(value('#area')).toBe('3');
    expect(value('#areaUnit')).toBe('Hectáreas');
    expect(value('#altitude')).toBe('1800');
    expect(value('#varieties')).toBe('Castillo, Caturra');
    expect(value('#otherVariety')).toBe('Gesha');
    expect(value('#email')).toBe('ana@finca.com');
    expect(value('#phoneAreaCode')).toBe('608');
    expect(value('#landline')).toBe('8765432');
  });
});
