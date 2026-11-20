import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router, RouterOutlet } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { SessionService } from '../../../core/session/session';
import { FeedPage } from '../../feed/pages/feed-page';
import { ProfilePage } from '../../profile/pages/profile-page';
import { OriginRegistrationPage } from './origin-registration-page';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

@Component({
  selector: 'app-spec-host',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class SpecHost {}

describe('Página de registro de origen', () => {
  let fixture: ComponentFixture<unknown>;
  let compiled: HTMLElement;

  afterEach(() => {
    TestBed.inject(OrigenDirectoDb).close();
  });

  async function open(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [OriginRegistrationPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OriginRegistrationPage);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  it('al abrir el formulario se ven el nombre, una sola variedad, el proceso, la descripción, el tueste, las notas, la altura, las evidencias, Guardar borrador y Publicar registro', async () => {
    await open();

    expect(label('Nombre del lote')).toBeTruthy();
    const variety = field('variedad') as HTMLSelectElement;
    expect(variety.multiple).toBe(false);
    expect(optionTexts(variety)).toEqual([
      'Castillo',
      'Caturra',
      'Geisha',
      'Bourbon',
      'Tabi',
      'Typica',
      'Colombia',
    ]);

    const process = field('proceso') as HTMLSelectElement;
    expect(optionTexts(process)).toEqual(['Lavado', 'Honey', 'Natural', 'Anaeróbico', 'Láctico']);
    expect(compiled.querySelector('textarea')?.getAttribute('placeholder')).toBe(
      'Describe el proceso (opcional)',
    );

    const roast = field('tueste') as HTMLSelectElement;
    expect(roast.multiple).toBe(false);
    expect(optionTexts(roast)).toEqual(['Claro / Ligero', 'Medio', 'Oscuro']);

    expect(label('Notas de cata')).toBeTruthy();
    expect(compiled.querySelector('#nota')?.getAttribute('placeholder')).toBe(
      'Escribe una nota y presiona Enter',
    );
    expect(label('Altura (m.s.n.m.)')).toBeTruthy();
    expect(label('Evidencias (JPG, PNG o PDF · máx. 5 MB)')).toBeTruthy();
    expect(compiled.querySelector('input[type="file"]')).toBeTruthy();
    expect(button('Guardar borrador')).toBeTruthy();
    expect(button('Publicar registro')).toBeTruthy();
  });

  it('Publicar con un obligatorio vacío o con una altura que no es un entero entre 100 y 4000 no guarda y muestra el error en el campo', async () => {
    await open();

    publish();

    expect(errorFor('nombre')).toBe('Ingrese el nombre del lote');
    expect(errorFor('variedad')).toBe('Debe indicar la variedad del grano');
    expect(errorFor('proceso')).toBe('Seleccione el método de fermentación');
    expect(errorFor('tueste')).toBe('Seleccione el perfil de tueste');
    expect(errorFor('nota')).toBe('Agregue al menos una nota de cata');
    expect(errorFor('altura')).toBe('Indique la altura del cultivo');
    expect(compiled.textContent).not.toContain('¡Origen registrado con éxito!');

    setValue('nombre', 'Lote 4 · Bourbon Natural');
    setValue('variedad', 'Bourbon');
    setValue('proceso', 'Natural');
    setValue('tueste', 'Medio');
    addNote('panela');

    setValue('altura', '12a');
    publish();
    expect(errorFor('altura')).toBe('Solo se permiten números');
    expect(errorFor('nombre')).toBe('');
    expect(compiled.textContent).not.toContain('¡Origen registrado con éxito!');

    setValue('altura', '99');
    publish();
    expect(errorFor('altura')).toBe('Ingrese una altura entre 100 y 4000 m.s.n.m.');

    setValue('altura', '4001');
    publish();
    expect(errorFor('altura')).toBe('Ingrese una altura entre 100 y 4000 m.s.n.m.');
    expect(compiled.textContent).not.toContain('¡Origen registrado con éxito!');
  });

  it('Un JPG, PNG o PDF de hasta 5 MB muestra la vista previa', async () => {
    await open();

    await attach(new File([new Uint8Array([1, 2, 3])], 'grano.jpg', { type: 'image/jpeg' }));
    expect(preview('grano.jpg')?.src.startsWith('data:image/jpeg')).toBe(true);

    await attach(new File([new Uint8Array([4, 5, 6])], 'grano.png', { type: 'image/png' }));
    expect(preview('grano.png')?.src.startsWith('data:image/png')).toBe(true);

    await attach(new File([new Uint8Array([7, 8, 9])], 'certificado.pdf', { type: 'application/pdf' }));
    expect(compiled.textContent).toContain('certificado.pdf');
    expect(preview('grano.jpg')).toBeTruthy();
    expect(preview('grano.png')).toBeTruthy();
  });

  it('Un archivo de otro tipo o de más de 5 MB avisa y no queda adjunto', async () => {
    await open();

    await attach(new File([new Uint8Array([1])], 'notas.txt', { type: 'text/plain' }));
    expect(compiled.textContent).toContain('notas.txt: formato no permitido');
    expect(preview('notas.txt')).toBeFalsy();
    expect(compiled.querySelector('.thumbs')?.textContent ?? '').not.toContain('notas.txt');

    await attach(
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.jpg', { type: 'image/jpeg' }),
    );
    expect(compiled.textContent).toContain('grande.jpg: supera 5 MB');
    expect(preview('grande.jpg')).toBeFalsy();
  });

  it('Guardar borrador solo con el nombre lo deja fuera del perfil y del feed, y la finca avisa que hay borradores sin publicar', async () => {
    localStorage.removeItem('od.session');
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [SpecHost],
      providers: [
        provideRouter([
          {
            path: 'origenes',
            loadChildren: () => import('../routes').then((m) => m.routes),
          },
          { path: 'perfil/:id', component: ProfilePage },
          { path: '', component: FeedPage },
        ]),
      ],
    }).compileComponents();

    TestBed.inject(SessionService).start({
      farmId: 'OD-2026-100001',
      ownerName: 'Ana',
      farmName: 'Finca La Esperanza',
    });

    const router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SpecHost);
    compiled = fixture.nativeElement as HTMLElement;
    await router.navigateByUrl('/origenes/registrar');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    setValue('nombre', 'Lote Borrador del Alto');
    button('Guardar borrador')?.click();
    await untilText('1 borrador sin publicar.');

    expect(compiled.textContent).toContain('1 borrador sin publicar.');

    await TestBed.inject(OrigenDirectoDb).table('fincas').add({
      id: 'OD-2026-100001',
      farmName: 'Finca La Esperanza',
      ownerName: 'Ana',
      department: 'Huila',
      municipality: 'Pitalito',
      village: '',
      area: '',
      areaUnit: '',
      altitude: '',
      varieties: [],
      otherVariety: '',
      email: '',
      mobile: '',
      phoneAreaCode: '',
      landline: '',
      bio: '',
      experience: '',
      photos: [],
      pdf: null,
    });

    await router.navigateByUrl('/perfil/OD-2026-100001');
    fixture.detectChanges();
    await untilText('Finca La Esperanza');
    expect(compiled.textContent).not.toContain('Lote Borrador del Alto');

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await untilText('Fincas');
    expect(compiled.textContent).not.toContain('Lote Borrador del Alto');
  });

  it('Publicar con los datos completos guarda el origen y vuelve a la finca', async () => {
    localStorage.removeItem('od.session');
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [SpecHost],
      providers: [
        provideRouter([
          {
            path: 'origenes',
            loadChildren: () => import('../routes').then((m) => m.routes),
          },
        ]),
      ],
    }).compileComponents();

    TestBed.inject(SessionService).start({
      farmId: 'OD-2026-100001',
      ownerName: 'Ana',
      farmName: 'Finca La Esperanza',
    });

    const router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SpecHost);
    compiled = fixture.nativeElement as HTMLElement;
    await router.navigateByUrl('/origenes/registrar');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    setValue('nombre', 'Lote 4 · Bourbon Natural');
    setValue('variedad', 'Bourbon');
    setValue('proceso', 'Natural');
    setValue('tueste', 'Medio');
    addNote('panela');
    setValue('altura', '1750');
    button('Publicar registro')?.click();
    await untilText('Lote 4 · Bourbon Natural');

    expect(router.url).toBe('/origenes');
    expect(compiled.textContent).toContain('Lote 4 · Bourbon Natural');
    expect(compiled.querySelector('a[href*="editar="]')?.textContent).toContain('Editar');
  });

  function label(text: string): HTMLLabelElement | undefined {
    return [...compiled.querySelectorAll('label')].find((item) => item.textContent?.trim() === text);
  }

  function field(id: string): HTMLElement {
    const el = compiled.querySelector(`#${id}`);
    if (!el) {
      throw new Error(`#${id} not found`);
    }
    return el as HTMLElement;
  }

  function optionTexts(select: HTMLSelectElement): string[] {
    return [...select.options].map((option) => option.text).filter((text) => text !== 'Selecciona…');
  }

  function button(text: string): HTMLButtonElement | undefined {
    return [...compiled.querySelectorAll('button')].find((item) => item.textContent?.trim() === text);
  }

  function publish(): void {
    button('Publicar registro')?.click();
    fixture.detectChanges();
  }

  function errorFor(id: string): string {
    return field(id).parentElement?.querySelector('.err')?.textContent?.trim() ?? '';
  }

  function setValue(id: string, value: string): void {
    const el = field(id) as HTMLInputElement | HTMLSelectElement;
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function addNote(value: string): void {
    const note = field('nota') as HTMLInputElement;
    note.value = value;
    note.dispatchEvent(new Event('input'));
    note.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
  }

  async function attach(file: File): Promise<void> {
    const input = field('evidencias') as HTMLInputElement;
    const list = Object.assign([file], {
      item: (index: number) => (index === 0 ? file : null),
    });
    Object.defineProperty(input, 'files', { configurable: true, value: list });
    input.dispatchEvent(new Event('change'));
    for (let attempt = 0; attempt < 20 && !compiled.textContent?.includes(file.name); attempt++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 20));
      fixture.detectChanges();
    }
  }

  function preview(name: string): HTMLImageElement | undefined {
    return [...compiled.querySelectorAll('img')].find((img) => img.alt === name);
  }

  async function untilText(text: string): Promise<void> {
    for (let attempt = 0; attempt < 40 && !compiled.textContent?.includes(text); attempt++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }
  }
});
