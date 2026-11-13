import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router, RouterOutlet } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { SessionService } from '../../../core/session/session';
import { installDemoAssets } from '../../../../testing/demo-assets';
import { FeedPage } from '../../feed/pages/feed-page';
import { Lot } from '../data/lot';
import { LotsPage } from './lots-page';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

let view: HTMLElement = document.body;

describe('Página de mis lotes', () => {
  let fixture: ComponentFixture<LotsPage>;
  let compiled: HTMLElement;
  let login = 'OD-2026-100001';

  beforeEach(async () => {
    login = 'OD-2026-100001';
    localStorage.removeItem('od.session');
    installDemoAssets();
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [LotsPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap() {
                return convertToParamMap({ login });
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
    TestBed.inject(SessionService).start({
      farmId: login,
      ownerName: 'Ana',
      farmName: 'Finca La Esperanza',
    });
    fixture = TestBed.createComponent(LotsPage);
    compiled = fixture.nativeElement as HTMLElement;
    view = compiled;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function untilText(text: string): Promise<void> {
    for (let attempt = 0; attempt < 40 && !compiled.textContent?.includes(text); attempt++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }
  }

  async function saveFarm(): Promise<void> {
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('fincas').add({
      id: 'OD-2026-100001',
      farmName: 'Finca La Esperanza',
      department: 'Huila',
      municipality: 'Pitalito',
      village: '',
      area: '',
      areaUnit: 'Hectáreas',
      altitude: '',
      varieties: ['Castillo'],
      otherVariety: '',
      ownerName: 'Ana',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '123',
      email: 'ana@finca.com',
      mobile: '',
      phoneAreaCode: '',
      landline: '',
      bio: 'Café de altura.',
      experience: '',
      photos: [],
      pdf: null,
    });
  }

  async function addLot(overrides: Partial<Lot> & Pick<Lot, 'id' | 'farmId'>): Promise<void> {
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('lotes').add({
      quantity: 25,
      unit: 'sacos',
      variety: 'Castillo',
      altitude: 1750,
      price: 1250000,
      status: 'Disponible',
      notes: '',
      active: true,
      publishedOn: '2026-01-01',
      ...overrides,
    });
  }

  function setControl(id: string, value: string): void {
    const el = compiled.querySelector(`#${id}`) as HTMLInputElement | null;
    if (!el) {
      throw new Error(`#${id} not found`);
    }
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
    el.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  function openCreate(): void {
    button('Publicar nuevo lote').click();
    fixture.detectChanges();
  }

  function fillValid(): void {
    setControl('cantidad', '20');
    setControl('unidad', 'sacos');
    setControl('variedad', 'Caturra');
    setControl('altitud', '1750');
    setControl('precio', '85000');
  }

  it('con login, lista los lotes activos de esa finca con variedad, cantidad, altitud, precio y estado, y no los de otra', async () => {
    await addLot({ id: 'propio', farmId: 'OD-2026-100001' });
    await addLot({
      id: 'inactivo',
      farmId: 'OD-2026-100001',
      variety: 'Geisha',
      active: false,
    });
    await addLot({ id: 'ajeno', farmId: 'OD-2026-200002', variety: 'Bourbon' });
    await render();
    await untilText('Castillo');

    expect(compiled.textContent).toContain('Castillo');
    expect(compiled.textContent).toContain('25 sacos (70kg)');
    expect(compiled.textContent).toContain('1.750 m.s.n.m.');
    expect(compiled.textContent).toContain('$1.250.000 COP / saco');
    expect(compiled.textContent).toContain('Disponible');
    expect(compiled.textContent).not.toContain('Geisha');
    expect(compiled.textContent).not.toContain('Bourbon');
    expect(button('Editar')).toBeTruthy();
    expect(button('Eliminar')).toBeTruthy();
  });

  it('sin lotes activos, muestra el vacío y «Publicar nuevo lote»', async () => {
    await addLot({ id: 'inactivo', farmId: 'OD-2026-100001', variety: 'Geisha', active: false });
    await render();
    await new Promise((resolve) => setTimeout(resolve, 100));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Aún no tienes lotes publicados. Usa “Publicar nuevo lote”.');
    expect(compiled.textContent).toContain('Publicar nuevo lote');
    expect(compiled.textContent).not.toContain('Geisha');
  });

  it('un lote válido se publica, queda guardado en esa finca, aparece en la lista y avisa el éxito', async () => {
    await saveFarm();
    await render();
    openCreate();
    fillValid();

    expect(button('Publicar lote').disabled).toBe(false);
    button('Publicar lote').click();
    await untilText('¡Lote Publicado con éxito! Ya se encuentra visible en el catálogo público de OrigenDirecto.');

    expect(compiled.textContent).toContain(
      '¡Lote Publicado con éxito! Ya se encuentra visible en el catálogo público de OrigenDirecto.',
    );
    expect(compiled.textContent).toContain('Caturra');
    expect(compiled.textContent).toContain('20 sacos (70kg)');
    const rows = await TestBed.inject(OrigenDirectoDb).table('lotes').toArray();
    expect(rows).toEqual([
      expect.objectContaining({
        farmId: 'OD-2026-100001',
        quantity: 20,
        unit: 'sacos',
        variety: 'Caturra',
        altitude: 1750,
        price: 85000,
        status: 'Disponible',
        active: true,
      }),
    ]);
  });

  it('con cantidad vacía, cero o decimal, «Publicar lote» sigue deshabilitado y, al tocar el campo, se ve el error', async () => {
    await render();
    openCreate();

    setControl('cantidad', '');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('La cantidad es obligatoria.');

    setControl('cantidad', '0');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain(
      'Ingresa un número entero positivo, sin decimales, espacios ni caracteres especiales.',
    );

    setControl('cantidad', '1.5');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain(
      'Ingresa un número entero positivo, sin decimales, espacios ni caracteres especiales.',
    );
  });

  it('sin unidad, «Publicar lote» sigue deshabilitado y se ve «Selecciona la unidad de medida.»', async () => {
    await render();
    openCreate();
    fillValid();
    setControl('unidad', '');

    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('Selecciona la unidad de medida.');
  });

  it('sin variedad no publica; «Otra» exige el nombre (máximo 50) y ese nombre queda como variedad', async () => {
    await render();
    openCreate();
    fillValid();
    setControl('variedad', '');

    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('Selecciona una variedad.');

    setControl('variedad', 'Otra');
    setControl('otra', '   ');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('Escribe el nombre de la variedad.');

    setControl('otra', 'a'.repeat(51));
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('Máximo 50 caracteres.');

    setControl('otra', 'Pink Bourbon');
    button('Publicar lote').click();
    await untilText('Pink Bourbon');

    expect(compiled.textContent).toContain('Pink Bourbon');
    const rows = await TestBed.inject(OrigenDirectoDb).table('lotes').toArray();
    expect(rows).toEqual([expect.objectContaining({ variety: 'Pink Bourbon' })]);

    button('Editar').click();
    fixture.detectChanges();
    expect((compiled.querySelector('#variedad') as HTMLSelectElement).value).toBe('Otra');
    expect((compiled.querySelector('#otra') as HTMLInputElement).value).toBe('Pink Bourbon');
  });

  it('altitud vacía, con letras o fuera de 500–2500 no publica y muestra el error bajo el campo', async () => {
    await render();
    openCreate();
    fillValid();

    setControl('altitud', '');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('La altitud es obligatoria.');

    setControl('altitud', '12a');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('Solo números enteros, sin decimales ni letras.');

    setControl('altitud', '499');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('La altitud debe estar entre 500 y 2500 m.s.n.m.');

    setControl('altitud', '2501');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('La altitud debe estar entre 500 y 2500 m.s.n.m.');

    setControl('altitud', '2500');
    expect(button('Publicar lote').disabled).toBe(false);
  });

  it('precio vacío, cero o con decimales no publica; un entero en COP sí', async () => {
    await render();
    openCreate();
    fillValid();

    setControl('precio', '');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('El precio es obligatorio.');

    setControl('precio', '0');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('El precio debe ser mayor a cero.');

    setControl('precio', '10.5');
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.textContent).toContain('Ingresa un valor en pesos (COP), sin decimales ni signos.');

    setControl('precio', '85000');
    expect(button('Publicar lote').disabled).toBe(false);
    button('Publicar lote').click();
    await untilText('$85.000');

    expect(compiled.textContent).toContain('$85.000 COP / saco');
  });

  it('las notas son opcionales, no pasan de 300 y el contador muestra lo escrito', async () => {
    await render();
    openCreate();
    fillValid();

    expect(button('Publicar lote').disabled).toBe(false);
    expect(compiled.querySelector('#cntNotas')?.textContent).toBe('0/300');

    setControl('notas', 'Lavado');
    expect(compiled.querySelector('#cntNotas')?.textContent).toBe('6/300');

    setControl('notas', 'a'.repeat(301));
    expect(button('Publicar lote').disabled).toBe(true);
    expect(compiled.querySelector('#cntNotas')?.textContent).toBe('301/300');

    setControl('notas', 'Lavado');
    button('Publicar lote').click();
    await untilText('Lavado');
    expect(compiled.textContent).toContain('Lavado');
  });

  it('«Cancelar» cierra sin guardar', async () => {
    await render();
    openCreate();
    fillValid();
    button('Cancelar').click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(compiled.querySelector('form')).toBeNull();
    expect(await TestBed.inject(OrigenDirectoDb).table('lotes').count()).toBe(0);
  });

  it('«Editar» abre los datos actuales, permite cambiar el estado y «Guardar cambios» actualiza la ficha y avisa', async () => {
    await addLot({ id: 'propio', farmId: 'OD-2026-100001', notes: 'Lavado' });
    await TestBed.inject(OrigenDirectoDb).table('novedades').add({
      id: 'novedad-propio',
      lotId: 'propio',
      title: 'Castillo',
      farmName: 'Finca La Esperanza',
      municipality: 'Pitalito',
      department: 'Huila',
      publishedOn: '2026-01-01',
    });
    await render();
    await untilText('Castillo');
    button('Editar').click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Editar lote');
    expect((compiled.querySelector('#cantidad') as HTMLInputElement).value).toBe('25');
    expect((compiled.querySelector('#unidad') as HTMLSelectElement).value).toBe('sacos');
    expect((compiled.querySelector('#variedad') as HTMLSelectElement).value).toBe('Castillo');
    expect((compiled.querySelector('#altitud') as HTMLInputElement).value).toBe('1750');
    expect((compiled.querySelector('#precio') as HTMLInputElement).value).toBe('1.250.000');
    expect((compiled.querySelector('#estado') as HTMLSelectElement).value).toBe('Disponible');
    expect((compiled.querySelector('#notas') as HTMLTextAreaElement).value).toBe('Lavado');
    expect(compiled.querySelector('#otra')).toBeNull();

    setControl('estado', 'Vendido');
    button('Guardar cambios').click();
    await untilText('¡Lote Actualizado con éxito! Ya se encuentra visible en el catálogo público de OrigenDirecto.');

    expect(compiled.textContent).toContain(
      '¡Lote Actualizado con éxito! Ya se encuentra visible en el catálogo público de OrigenDirecto.',
    );
    expect(compiled.textContent).toContain('Vendido');
    const rows = await TestBed.inject(OrigenDirectoDb).table('lotes').toArray();
    expect(rows).toEqual([expect.objectContaining({ status: 'Vendido', variety: 'Castillo' })]);
  });

  it('«Eliminar» pide confirmación; «Cancelar» no quita el lote y «Confirmar eliminación» lo deja inactivo', async () => {
    await addLot({ id: 'propio', farmId: 'OD-2026-100001' });
    await render();
    await untilText('Castillo');

    button('Eliminar').click();
    fixture.detectChanges();
    expect(compiled.textContent).toContain(
      '¿Estás seguro de que deseas eliminar el lote Castillo - 25 sacos (70kg)? Esta acción no se puede deshacer y el lote dejará de estar visible para compradores.',
    );

    button('Cancelar').click();
    fixture.detectChanges();
    expect(compiled.textContent).not.toContain('¿Estás seguro');
    expect(compiled.textContent).toContain('Castillo');

    button('Eliminar').click();
    fixture.detectChanges();
    button('Confirmar eliminación').click();
    await untilText('El lote ha sido eliminado correctamente.');

    expect(compiled.textContent).toContain('El lote ha sido eliminado correctamente.');
    expect(compiled.textContent).not.toContain('Castillo');
    const rows = await TestBed.inject(OrigenDirectoDb).table('lotes').toArray();
    expect(rows).toEqual([expect.objectContaining({ id: 'propio', active: false })]);
  });
});

@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class Host {}

describe('Lote publicado en el carrusel', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    localStorage.removeItem('od.session');
    installDemoAssets();
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideRouter([
          { path: '', component: FeedPage },
          { path: 'mis-lotes', component: LotsPage },
        ]),
      ],
    }).compileComponents();
    TestBed.inject(SessionService).start({
      farmId: 'OD-2026-100001',
      ownerName: 'Ana',
      farmName: 'Finca La Esperanza',
    });
  });

  afterEach(() => {
    TestBed.inject(OrigenDirectoDb).close();
  });

  async function render(url: string): Promise<void> {
    await TestBed.inject(Router).navigateByUrl(url);
    fixture = TestBed.createComponent(Host);
    view = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function go(url: string): Promise<void> {
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function untilText(text: string): Promise<void> {
    for (let attempt = 0; attempt < 40 && !view.textContent?.includes(text); attempt++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }
  }

  async function finishLoading(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fixture.detectChanges();
  }

  async function saveFarm(): Promise<void> {
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('fincas').add({
      id: 'OD-2026-100001',
      farmName: 'Finca La Esperanza',
      department: 'Huila',
      municipality: 'Pitalito',
      village: '',
      area: '',
      areaUnit: 'Hectáreas',
      altitude: '',
      varieties: ['Castillo'],
      otherVariety: '',
      ownerName: 'Ana',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '123',
      email: 'ana@finca.com',
      mobile: '',
      phoneAreaCode: '',
      landline: '',
      bio: 'Café de altura.',
      experience: '',
      photos: [],
      pdf: null,
    });
  }

  function setControl(id: string, value: string): void {
    const el = view.querySelector(`#${id}`) as HTMLInputElement | null;
    if (!el) {
      throw new Error(`#${id} not found`);
    }
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
    el.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  it('al publicar, el carrusel muestra ese lote como el más reciente', async () => {
    await saveFarm();
    await TestBed.inject(OrigenDirectoDb).table('novedades').add({
      id: 'vieja',
      lotId: 'otro',
      title: 'Bourbon',
      farmName: 'Finca Vieja',
      municipality: 'Neiva',
      department: 'Huila',
      publishedOn: '2020-01-01',
    });
    await render('/mis-lotes?login=OD-2026-100001');
    button('Publicar nuevo lote').click();
    fixture.detectChanges();
    setControl('cantidad', '20');
    setControl('unidad', 'sacos');
    setControl('variedad', 'Caturra');
    setControl('altitud', '1750');
    setControl('precio', '85000');
    button('Publicar lote').click();
    await untilText('¡Lote Publicado con éxito!');

    await go('/');
    await finishLoading();
    await untilText('Caturra');

    const novedad = () => view.querySelector('[aria-label="Novedades"]');
    expect(novedad()?.textContent).toContain('Caturra');
    expect(novedad()?.textContent).toContain('Finca La Esperanza');
    expect(novedad()?.textContent).toContain('Pitalito');
    expect(novedad()?.textContent).toContain('Huila');

    button('Siguiente').click();
    fixture.detectChanges();
    expect(novedad()?.textContent).toContain('Bourbon');
  });

  it('al guardar una variedad nueva, el carrusel la muestra; al confirmar la eliminación, desaparece', async () => {
    await saveFarm();
    await render('/mis-lotes?login=OD-2026-100001');
    button('Publicar nuevo lote').click();
    fixture.detectChanges();
    setControl('cantidad', '20');
    setControl('unidad', 'kg');
    setControl('variedad', 'Castillo');
    setControl('altitud', '1750');
    setControl('precio', '85000');
    button('Publicar lote').click();
    await untilText('¡Lote Publicado con éxito!');

    button('Editar').click();
    fixture.detectChanges();
    setControl('variedad', 'Geisha');
    button('Guardar cambios').click();
    await untilText('¡Lote Actualizado con éxito!');

    await go('/');
    await finishLoading();
    await untilText('Geisha');
    expect(view.querySelector('[aria-label="Novedades"] h3')?.textContent).toContain('Geisha');
    expect(view.querySelector('[aria-label="Novedades"]')?.textContent).not.toContain('Castillo');

    await go('/mis-lotes?login=OD-2026-100001');
    await untilText('Geisha');
    button('Eliminar').click();
    fixture.detectChanges();
    button('Confirmar eliminación').click();
    await untilText('El lote ha sido eliminado correctamente.');

    await go('/');
    await finishLoading();
    expect(view.textContent).not.toContain('Geisha');
  });
});

function button(label: string): HTMLButtonElement {
  const found = [...view.querySelectorAll('button')].find(
    (el) => el.textContent?.includes(label) || el.getAttribute('aria-label') === label,
  );
  if (!found) {
    throw new Error(`Button "${label}" not found`);
  }
  return found as HTMLButtonElement;
}
