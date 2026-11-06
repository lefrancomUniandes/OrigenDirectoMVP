import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { routes } from '../../../app.routes';
import { Shell } from '../../../layout/shell/shell';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

describe('Página de registro', () => {
  let fixture: ComponentFixture<Shell>;
  let compiled: HTMLElement;

  async function open(url: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  }

  it('en /register muestra el hero con el botón Comenzar registro', async () => {
    await open('/register');

    const hero = compiled.querySelector('app-register-page .hero');

    expect(hero).toBeTruthy();
    expect(button('Comenzar registro', hero ?? compiled)).toBeTruthy();
  });

  it('en /register muestra los pasos Tu finca, Tus datos y Documentos', async () => {
    await open('/register');

    const page = compiled.querySelector('app-register-page');

    expect(page?.textContent).toContain('Tu finca');
    expect(page?.textContent).toContain('Tus datos');
    expect(page?.textContent).toContain('Documentos');
  });

  it('Comenzar registro abre el mismo modal del paso 1', async () => {
    await open('/register');

    button('Comenzar registro', compiled.querySelector('app-register-page') ?? compiled).click();
    await fixture.whenStable();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
    expect(dialog?.textContent).toContain('Nombre de la finca');
  });

  it('el enlace «Cómo registrar tu finca» abre /register', async () => {
    await open('/');

    expect(compiled.querySelector('.hero')).toBeNull();

    const link = [...compiled.querySelectorAll('a')].find((el) =>
      el.textContent?.includes('Cómo registrar tu finca'),
    );

    expect(link).toBeTruthy();
    link!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/register');
    expect(compiled.querySelector('app-register-page .hero')).toBeTruthy();
  });
});

function button(label: string, root: ParentNode): HTMLButtonElement {
  const found = [...root.querySelectorAll('button')].find((el) => el.textContent?.includes(label));
  if (!found) {
    throw new Error(`Button "${label}" not found`);
  }
  return found as HTMLButtonElement;
}
