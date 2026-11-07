import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { installDemoAssets } from '../../../../testing/demo-assets';
import { FeedPage } from './feed-page';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

describe('Página del feed', () => {
  let fixture: ComponentFixture<FeedPage>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    installDemoAssets();
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [FeedPage],
      providers: [provideRouter([{ path: '**', component: FeedPage }])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(OrigenDirectoDb).close();
  });

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(FeedPage);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  }

  async function finishLoading(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fixture.detectChanges();
  }

  async function saveFarm(photos: { type: string; bytes: ArrayBuffer }[] = []): Promise<void> {
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
      bio: 'Café de altura cultivado bajo sombra.',
      experience: '',
      photos,
      pdf: null,
    });
  }

  async function untilText(text: string): Promise<void> {
    for (let attempt = 0; attempt < 40 && !fincas()?.textContent?.includes(text); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }
  }

  function fincas(): HTMLElement | null {
    return compiled.querySelector('[aria-label="Fincas"]');
  }

  it('sin fincas, muestra «Pronto encontrarás historias y fincas artesanales conectadas directamente con el origen»', async () => {
    await render();
    await finishLoading();
    await untilText('Finca El Paraíso');
    await TestBed.inject(OrigenDirectoDb).table('fincas').clear();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();

    expect(fincas()?.textContent).toContain(
      'Pronto encontrarás historias y fincas artesanales conectadas directamente con el origen',
    );
  });

  it('al entrar muestra «Cargando» y una finca sembrada al terminar la espera', async () => {
    await render();

    expect(compiled.textContent).toContain('Cargando');
    expect(compiled.textContent).not.toContain('Finca El Paraíso');

    await finishLoading();
    await untilText('Finca El Paraíso');

    expect(fincas()?.textContent).toContain('Finca El Paraíso');
    expect(compiled.textContent).not.toContain('Cargando');
  });

  it('con una finca guardada, la tarjeta muestra su nombre, «Pitalito, Huila» y su biografía', async () => {
    await saveFarm();
    await render();
    await finishLoading();

    expect(compiled.textContent).toContain('Finca La Esperanza');
    expect(compiled.textContent).toContain('Pitalito, Huila');
    expect(compiled.textContent).toContain('Café de altura cultivado bajo sombra.');
  });

  it('«Visitar perfil» abre /perfil/<id> y conserva login', async () => {
    await saveFarm();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/?login=OD-2026-200002');
    await render();
    await finishLoading();

    button('Visitar perfil', compiled).click();
    await fixture.whenStable();

    expect(router.url).toBe('/perfil/OD-2026-100001?login=OD-2026-200002');
  });

  it('si esa finca tiene foto, la tarjeta muestra la imagen', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]).buffer;
    await saveFarm([{ type: 'image/jpeg', bytes }]);
    await render();
    await finishLoading();

    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    const shown = new Uint8Array(await (await fetch(img!.src)).arrayBuffer());
    expect([...shown]).toEqual([1, 2, 3, 4]);
  });

  it('si aparece una finca nueva en la tabla, el feed muestra su tarjeta', async () => {
    await render();
    await finishLoading();
    await saveFarm();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Finca La Esperanza');
    expect(compiled.textContent).toContain('Pitalito, Huila');
  });

  it('el carrusel muestra primero «Lote 1 · Caturra Honey» de Finca El Paraíso, en Urrao, Antioquia', async () => {
    await render();
    await finishLoading();

    const novedad = compiled.querySelector('[aria-label="Novedades"]');

    expect(novedad?.textContent).toContain('Lote 1 · Caturra Honey');
    expect(novedad?.textContent).toContain('Finca El Paraíso');
    expect(novedad?.textContent).toContain('Urrao');
    expect(novedad?.textContent).toContain('Antioquia');
  });

  it('la flecha derecha pasa a «Lote 3 · Tabi Honey» y la izquierda vuelve a «Lote 1 · Caturra Honey»', async () => {
    await render();
    await finishLoading();

    const novedad = () => compiled.querySelector('[aria-label="Novedades"]');
    button('Siguiente', compiled).click();
    fixture.detectChanges();

    expect(novedad()?.textContent).toContain('Lote 3 · Tabi Honey');
    expect(novedad()?.textContent).toContain('Finca Alto de los Ángeles');
    expect(novedad()?.textContent).toContain('Chinchiná');
    expect(novedad()?.textContent).toContain('Caldas');

    button('Anterior', compiled).click();
    fixture.detectChanges();

    expect(novedad()?.textContent).toContain('Lote 1 · Caturra Honey');
  });

  it('al entrar muestra El Paraíso, Alto de los Ángeles, La Fortuna y El Roble', async () => {
    await render();
    await finishLoading();
    await untilText('Finca El Roble');

    expect(fincas()?.textContent).toContain('Finca El Paraíso');
    expect(fincas()?.textContent).toContain('Finca Alto de los Ángeles');
    expect(fincas()?.textContent).toContain('Finca La Fortuna');
    expect(fincas()?.textContent).toContain('Finca El Roble');
  });
});

function button(label: string, root: ParentNode): HTMLButtonElement {
  const found = [...root.querySelectorAll('button')].find(
    (el) => el.textContent?.includes(label) || el.getAttribute('aria-label') === label,
  );
  if (!found) {
    throw new Error(`Button "${label}" not found`);
  }
  return found as HTMLButtonElement;
}
