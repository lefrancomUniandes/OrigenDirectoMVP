import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router, RouterOutlet } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { SessionService } from '../../../core/session/session';
import { installDemoAssets } from '../../../../testing/demo-assets';
import { ProfilePage } from './profile-page';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

@Component({
  selector: 'app-profile-spec-host',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class SpecHost {}

describe('Página del perfil', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let compiled: HTMLElement;
  let current: ComponentFixture<unknown> | undefined;
  let login = '';
  let farmId = 'OD-2026-100001';

  beforeEach(async () => {
    login = '';
    farmId = 'OD-2026-100001';
    localStorage.removeItem('od.session');
    installDemoAssets();
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get paramMap() {
                return convertToParamMap({ id: farmId });
              },
              get queryParamMap() {
                return convertToParamMap(login ? { login } : {});
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(async () => {
    current?.destroy();
    current = undefined;
    await new Promise((resolve) => setTimeout(resolve, 50));
    TestBed.inject(OrigenDirectoDb).close();
  });

  async function render(): Promise<void> {
    const session = TestBed.inject(SessionService);
    if (login) {
      session.start({ farmId: login, ownerName: 'Ana', farmName: 'Finca La Esperanza' });
    } else {
      session.end();
    }
    fixture = TestBed.createComponent(ProfilePage);
    current = fixture;
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

  it('al guardar, la cabecera y «La finca» muestran los datos nuevos', async () => {
    login = 'OD-2026-100001';
    await saveFarm();
    await render();

    const edit = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Editar perfil'),
    );
    edit!.click();
    fixture.detectChanges();

    const set = (selector: string, next: string) => {
      (compiled.querySelector(selector) as HTMLInputElement).value = next;
    };
    set('#farmName', 'Finca El Roble');
    set('#ownerName', 'Pedro Castaño');
    set('#municipality', 'Acevedo');
    set('#department', 'Caldas');
    set('#bio', 'Café lavado en pequeño lote.');
    set('#experience', '22');
    set('#mobile', '3110001122');
    set('#village', 'San Adolfo');
    set('#area', '8');
    set('#areaUnit', 'Cuadras');
    set('#altitude', '1650');
    set('#varieties', 'Tabi, Borbón');
    set('#otherVariety', 'Pink Bourbon');
    set('#email', 'pedro@elroble.com');
    set('#phoneAreaCode', '601');
    set('#landline', '1234567');

    const save = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Guardar'),
    );
    save!.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();

    const header = compiled.querySelector('header') as HTMLElement;
    const farm = compiled.querySelector('[aria-label="La finca"]') as HTMLElement;

    expect(header.textContent).toContain('Finca El Roble');
    expect(header.textContent).toContain('Pedro Castaño');
    expect(header.textContent).toContain('Acevedo, Caldas');
    expect(header.textContent).toContain('Café lavado en pequeño lote.');
    expect(header.textContent).toContain('22');
    expect(header.querySelector('a')?.getAttribute('href')).toBe('https://wa.me/3110001122');
    expect(farm.textContent).toContain('Finca El Roble');
    expect(farm.textContent).toContain('1650');
    expect(farm.textContent).toContain('San Adolfo');
    expect(farm.textContent).toContain('8 Cuadras');
    expect(farm.textContent).toContain('Tabi');
    expect(farm.textContent).toContain('Borbón');
    expect(farm.textContent).toContain('Pink Bourbon');
    expect(farm.textContent).toContain('pedro@elroble.com');
    expect(farm.textContent).toContain('3110001122');
    expect(farm.textContent).toContain('601');
    expect(farm.textContent).toContain('1234567');
  });

  it('al guardar, la publicación de presentación queda con la biografía y el contacto nuevos', async () => {
    login = 'OD-2026-100001';
    await saveFarm();
    const db = TestBed.inject(OrigenDirectoDb);
    await db.table('publicaciones').bulkAdd([
      {
        id: 'pub-presentacion',
        farmId: 'OD-2026-100001',
        publishedOn: '2026-11-07',
        text: 'Café de altura cultivado bajo sombra.\nana@finca.com\n3001234567\n8765432',
        photo: null,
      },
      {
        id: 'pub-proceso',
        farmId: 'OD-2026-100001',
        publishedOn: '2026-11-03',
        text: 'Fermentación en cereza',
        photo: null,
      },
    ]);
    await render();

    const edit = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Editar perfil'),
    );
    edit!.click();
    fixture.detectChanges();

    const set = (selector: string, next: string) => {
      (compiled.querySelector(selector) as HTMLInputElement).value = next;
    };
    set('#bio', 'Café lavado en pequeño lote.');
    set('#email', 'pedro@elroble.com');
    set('#mobile', '3110001122');
    set('#landline', '1234567');

    const save = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Guardar'),
    );
    save!.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();

    const posts = compiled.querySelector('[aria-label="Publicaciones"]') as HTMLElement;

    expect(posts.textContent).toContain('Café lavado en pequeño lote.');
    expect(posts.textContent).toContain('pedro@elroble.com');
    expect(posts.textContent).toContain('3110001122');
    expect(posts.textContent).toContain('1234567');
    expect(posts.textContent).toContain('Fermentación en cereza');
    expect(posts.textContent).not.toContain('ana@finca.com');
  });

  it('al guardar una foto nueva, el avatar muestra esa imagen', async () => {
    login = 'OD-2026-100001';
    await saveFarm();
    await render();

    const edit = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Editar perfil'),
    );
    edit!.click();
    fixture.detectChanges();

    const file = new File([new Uint8Array([9, 8, 7])], 'nueva.jpg', { type: 'image/jpeg' });
    const input = compiled.querySelector('#avatar') as HTMLInputElement;
    const list = {
      length: 1,
      item: () => file,
      0: file,
      *[Symbol.iterator]() {
        yield file;
      },
    };
    Object.defineProperty(input, 'files', { configurable: true, value: list });

    const save = [...compiled.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Guardar'),
    );
    save!.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();

    const avatar = compiled.querySelector('header img') as HTMLImageElement;
    const shown = new Uint8Array(await (await fetch(avatar.src)).arrayBuffer());

    expect([...shown]).toEqual([9, 8, 7]);
  });

  it('el perfil de Finca El Paraíso muestra «Fermentación en cereza»', async () => {
    farmId = 'demo-paraiso';
    await render();

    for (let attempt = 0; attempt < 40 && !compiled.textContent?.includes('Fermentación en cereza'); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }

    expect(compiled.textContent).toContain('Finca El Paraíso');
    expect(compiled.textContent).toContain('Fermentación en cereza');
  });

  it('el carrusel muestra la foto, Nuevo, la fecha, el nombre, la finca, el departamento, la variedad, el proceso, el tueste, la altura y las notas de los orígenes publicados y activos', async () => {
    await saveFarm();
    const db = TestBed.inject(OrigenDirectoDb);
    await db.table('origenes').add({
      id: 'origen-1',
      farmId: 'OD-2026-100001',
      name: 'Lote 4 · Bourbon Natural',
      status: 'publicado',
      active: true,
      publishedOn: '2026-11-28',
      variety: 'Bourbon',
      process: 'Natural',
      roast: 'Medio',
      altitude: 1750,
      notes: ['panela', 'durazno'],
      photo: 'data:image/jpeg;base64,AQID',
    });
    await render();

    for (
      let attempt = 0;
      attempt < 40 &&
      !compiled.querySelector('[aria-label="Orígenes"]')?.textContent?.includes('Lote 4 · Bourbon Natural');
      attempt++
    ) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }

    const carousel = compiled.querySelector('[aria-label="Orígenes"]') as HTMLElement;
    const photo = carousel.querySelector('img') as HTMLImageElement;

    expect(photo.getAttribute('src')).toBe('data:image/jpeg;base64,AQID');
    expect(photo.getAttribute('alt')).toBe('Lote 4 · Bourbon Natural');
    expect(carousel.textContent).toContain('Nuevo');
    expect(carousel.textContent).toContain('28 nov');
    expect(carousel.textContent).toContain('Lote 4 · Bourbon Natural');
    expect(carousel.textContent).toContain('Finca La Esperanza');
    expect(carousel.textContent).toContain('Huila');
    expect(carousel.textContent).toContain('Bourbon');
    expect(carousel.textContent).toContain('Natural');
    expect(carousel.textContent).toContain('Medio');
    expect(carousel.textContent).toContain('1750 m.s.n.m.');
    expect(carousel.textContent).toContain('panela');
    expect(carousel.textContent).toContain('durazno');
  });

  it('un borrador o un origen desactivado no sale en el carrusel', async () => {
    await saveFarm();
    const db = TestBed.inject(OrigenDirectoDb);
    await db.table('origenes').bulkAdd([
      {
        id: 'origen-activo',
        farmId: 'OD-2026-100001',
        name: 'Lote 4 · Bourbon Natural',
        status: 'publicado',
        active: true,
        publishedOn: '2026-11-28',
        variety: 'Bourbon',
        process: 'Natural',
        roast: 'Medio',
        altitude: 1750,
        notes: ['panela'],
        photo: '',
      },
      {
        id: 'origen-borrador',
        farmId: 'OD-2026-100001',
        name: 'Lote Borrador del Alto',
        status: 'borrador',
        active: true,
        publishedOn: '2026-11-20',
      },
      {
        id: 'origen-pausado',
        farmId: 'OD-2026-100001',
        name: 'Lote en pausa',
        status: 'publicado',
        active: false,
        publishedOn: '2026-11-20',
      },
    ]);
    await render();

    for (
      let attempt = 0;
      attempt < 40 &&
      !compiled.querySelector('[aria-label="Orígenes"]')?.textContent?.includes('Lote 4 · Bourbon Natural');
      attempt++
    ) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }

    const carousel = compiled.querySelector('[aria-label="Orígenes"]') as HTMLElement;
    expect(carousel.textContent).toContain('Lote 4 · Bourbon Natural');
    expect(carousel.textContent).not.toContain('Lote Borrador del Alto');
    expect(carousel.textContent).not.toContain('Lote en pausa');
  });

  it('sin esa sesión, las tarjetas no tienen Editar', async () => {
    await saveFarm();
    await TestBed.inject(OrigenDirectoDb).table('origenes').add(publishedOrigin());
    await render();
    await untilCarousel('Lote 4 · Bourbon Natural');

    const carousel = compiled.querySelector('[aria-label="Orígenes"]') as HTMLElement;
    const edit = [...carousel.querySelectorAll('a, button')].find((item) =>
      item.textContent?.includes('Editar'),
    );
    expect(edit).toBeUndefined();
  });

  it('con la sesión de esa finca, Editar abre el formulario con los datos del origen', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SpecHost],
      providers: [
        provideRouter([
          {
            path: 'perfil',
            loadChildren: () => import('../routes').then((m) => m.routes),
          },
          {
            path: 'origenes',
            loadChildren: () => import('../../origins/routes').then((m) => m.routes),
          },
        ]),
      ],
    }).compileComponents();

    TestBed.inject(SessionService).start({
      farmId: 'OD-2026-100001',
      ownerName: 'Ana',
      farmName: 'Finca La Esperanza',
    });
    await saveFarm();
    await TestBed.inject(OrigenDirectoDb).table('origenes').add(publishedOrigin());

    const router = TestBed.inject(Router);
    const host = TestBed.createComponent(SpecHost);
    current = host;
    compiled = host.nativeElement as HTMLElement;
    await router.navigateByUrl('/perfil/OD-2026-100001');
    host.detectChanges();
    await untilCarousel('Lote 4 · Bourbon Natural', host);

    const carousel = compiled.querySelector('[aria-label="Orígenes"]') as HTMLElement;
    const edit = [...carousel.querySelectorAll('a')].find((item) => item.textContent?.includes('Editar'));
    await router.navigateByUrl(edit?.getAttribute('href') ?? '');
    host.detectChanges();

    for (
      let attempt = 0;
      attempt < 40 &&
      (compiled.querySelector('#nombre') as HTMLInputElement | null)?.value !== 'Lote 4 · Bourbon Natural';
      attempt++
    ) {
      await host.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      host.detectChanges();
    }

    expect((compiled.querySelector('#nombre') as HTMLInputElement).value).toBe('Lote 4 · Bourbon Natural');
    expect((compiled.querySelector('#variedad') as HTMLSelectElement).value).toBe('Bourbon');
    expect((compiled.querySelector('#proceso') as HTMLSelectElement).value).toBe('Natural');
    expect((compiled.querySelector('#tueste') as HTMLSelectElement).value).toBe('Medio');
    expect((compiled.querySelector('#altura') as HTMLInputElement).value).toBe('1750');
    expect(compiled.textContent).toContain('panela');
    expect(compiled.textContent).toContain('durazno');
    expect(compiled.querySelector('.thumbs img')?.getAttribute('src')).toBe('data:image/jpeg;base64,AQID');
  });

  function publishedOrigin() {
    return {
      id: 'origen-1',
      farmId: 'OD-2026-100001',
      name: 'Lote 4 · Bourbon Natural',
      status: 'publicado',
      active: true,
      publishedOn: '2026-11-28',
      variety: 'Bourbon',
      process: 'Natural',
      roast: 'Medio',
      altitude: 1750,
      notes: ['panela', 'durazno'],
      photo: 'data:image/jpeg;base64,AQID',
    };
  }

  async function untilCarousel(
    text: string,
    host: ComponentFixture<unknown> = fixture,
  ): Promise<void> {
    for (
      let attempt = 0;
      attempt < 40 && !compiled.querySelector('[aria-label="Orígenes"]')?.textContent?.includes(text);
      attempt++
    ) {
      await host.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      host.detectChanges();
    }
  }
});
