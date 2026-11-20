import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { SessionService } from '../../../core/session/session';
import { FeedPage } from '../../feed/pages/feed-page';
import { ProfilePage } from '../../profile/pages/profile-page';
import { OriginsPage } from './origins-page';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

@Component({
  selector: 'app-origins-spec-host',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class SpecHost {}

describe('Orígenes de la finca', () => {
  let fixture: ComponentFixture<unknown>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('od.session');
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [OriginsPage],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(OrigenDirectoDb).close();
  });

  it('con orígenes publicados se ve la tarjeta, el interruptor y Editar', async () => {
    TestBed.inject(SessionService).start({
      farmId: 'OD-2026-100001',
      ownerName: 'Ana',
      farmName: 'Finca La Esperanza',
    });
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('origenes').add({
      id: 'origen-1',
      farmId: 'OD-2026-100001',
      name: 'Lote 4 · Bourbon Natural',
      status: 'publicado',
      publishedOn: '2026-11-28',
      active: true,
    });

    fixture = TestBed.createComponent(OriginsPage);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await untilText('Lote 4 · Bourbon Natural');

    expect(compiled.textContent).toContain('Lote 4 · Bourbon Natural');
    const toggle = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    expect(toggle.closest('label')?.textContent).toContain('Activo');
    expect(action('Editar')).toBeTruthy();
  });

  it('sin orígenes publicados se ve el aviso y el botón para registrar el primero', async () => {
    TestBed.inject(SessionService).start({
      farmId: 'OD-2026-100001',
      ownerName: 'Ana',
      farmName: 'Finca La Esperanza',
    });
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('origenes').add({
      id: 'borrador-1',
      farmId: 'OD-2026-100001',
      name: 'Lote Borrador del Alto',
      status: 'borrador',
      publishedOn: '2026-11-19',
      active: true,
    });

    fixture = TestBed.createComponent(OriginsPage);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await untilText('1 borrador sin publicar.');

    expect(compiled.textContent).toContain('Aún no hay orígenes publicados en esta finca.');
    const register = action('Registrar el primer origen');
    expect(register?.getAttribute('href')).toBe('/origenes/registrar');
    expect(compiled.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('al desactivar, la tarjeta queda marcada como desactivada y desaparece del feed y del perfil', async () => {
    TestBed.resetTestingModule();
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
    const db = TestBed.inject(OrigenDirectoDb);
    await db.open();
    await db.table('fincas').add({
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
    await db.table('origenes').add({
      id: 'origen-1',
      farmId: 'OD-2026-100001',
      name: 'Lote 4 · Bourbon Natural',
      status: 'publicado',
      publishedOn: '2026-11-28',
      active: true,
    });

    const router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SpecHost);
    compiled = fixture.nativeElement as HTMLElement;

    await router.navigateByUrl('/perfil/OD-2026-100001');
    fixture.detectChanges();
    await untilText('Lote 4 · Bourbon Natural');
    expect(compiled.textContent).toContain('Lote 4 · Bourbon Natural');

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await untilText('Lote 4 · Bourbon Natural');
    expect(compiled.textContent).toContain('Lote 4 · Bourbon Natural');

    await router.navigateByUrl('/origenes');
    fixture.detectChanges();
    await untilText('Lote 4 · Bourbon Natural');
    const toggle = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await untilText('Desactivado');

    expect(toggle.closest('label')?.textContent).toContain('Desactivado');
    expect(toggle.checked).toBe(false);

    await router.navigateByUrl('/perfil/OD-2026-100001');
    fixture.detectChanges();
    await untilText('Finca La Esperanza');
    await new Promise((resolve) => setTimeout(resolve, 100));
    fixture.detectChanges();
    expect(compiled.textContent).not.toContain('Lote 4 · Bourbon Natural');

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await untilText('Fincas');
    expect(compiled.textContent).not.toContain('Lote 4 · Bourbon Natural');
  });

  async function untilText(text: string): Promise<void> {
    for (let attempt = 0; attempt < 40 && !compiled.textContent?.includes(text); attempt++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 50));
      fixture.detectChanges();
    }
  }

  function action(text: string): Element | undefined {
    return [...compiled.querySelectorAll('button, a')].find((item) => item.textContent?.includes(text));
  }
});
