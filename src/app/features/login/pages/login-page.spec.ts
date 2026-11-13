import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { hashPassword } from '../../../core/auth/password-hash';
import { OrigenDirectoDb } from '../../../core/db/origen-directo.db';
import { RegistrationForm } from '../../../core/registration/registration-form';
import { SessionService } from '../../../core/session/session';
import { FarmRegistrationWizard } from '../../farm-registration/components/farm-registration-wizard';
import { emptyFarmDraft } from '../../farm-registration/data/farm-draft';
import { FarmRegistrationService } from '../../farm-registration/services/farm-registration.service';
import { LoginPage } from './login-page';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

@Component({ template: '' })
class Destination {}

@Component({
  imports: [RouterOutlet, FarmRegistrationWizard],
  template: `
    <router-outlet />
    @if (form.open()) {
      <app-farm-registration-wizard />
    }
  `,
})
class Host {
  readonly form = inject(RegistrationForm);
}

describe('Página de inicio de sesión', () => {
  let fixture: ComponentFixture<Host>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('od.session');
    localStorage.removeItem('od.login-attempts');
    await Dexie.delete('origen-directo');
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideRouter([
          { path: 'iniciar-sesion', component: LoginPage },
          { path: 'mis-lotes', component: Destination },
          { path: 'register', component: Destination },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    compiled = fixture.nativeElement as HTMLElement;
    await TestBed.inject(Router).navigateByUrl('/iniciar-sesion');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.inject(OrigenDirectoDb).close();
  });

  function button(label: string): HTMLButtonElement {
    const found = [...compiled.querySelectorAll('button')].find((el) => el.textContent?.includes(label));
    if (!found) {
      throw new Error(`Button "${label}" not found`);
    }
    return found as HTMLButtonElement;
  }

  async function type(id: string, value: string): Promise<void> {
    const input = compiled.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function blur(id: string): void {
    (compiled.querySelector(`#${id}`) as HTMLInputElement).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  async function addFarm(id: string, email: string, ownerName: string, farmName: string): Promise<void> {
    await TestBed.inject(OrigenDirectoDb).table('fincas').add({
      id,
      email,
      ownerName,
      farmName,
      passwordHash: await hashPassword('Cafe2026*'),
      verified: true,
    });
  }

  async function submitUntil(url: string): Promise<void> {
    button('Ingresar').click();
    const router = TestBed.inject(Router);
    for (let attempt = 0; attempt < 50 && router.url !== url; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
    }
  }

  async function submitUntilText(text: string): Promise<void> {
    button('Ingresar').click();
    for (let attempt = 0; attempt < 50 && !compiled.textContent?.includes(text); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
    }
  }

  function failures(email: string): number {
    const raw = localStorage.getItem('od.login-attempts');
    if (!raw) {
      return 0;
    }
    const state = (JSON.parse(raw) as Record<string, { count: number; lockedUntil: number | null }>)[email];
    if (!state) {
      return 0;
    }
    return state.lockedUntil ? 5 : state.count;
  }

  async function submitFailure(email: string): Promise<void> {
    const before = failures(email);
    button('Ingresar').click();
    for (let attempt = 0; attempt < 50 && failures(email) === before; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
    }
  }

  it('"Ingresar" sigue apagado con el formulario vacío y todavía no hay avisos', () => {
    expect(button('Ingresar').disabled).toBe(true);
    expect(compiled.textContent).not.toContain('Ingresa tu correo electrónico');
    expect(compiled.textContent).not.toContain('Ingresa un correo válido');
    expect(compiled.textContent).not.toContain('El correo no puede superar 120 caracteres');
    expect(compiled.textContent).not.toContain('Ingresa tu contraseña');
    expect(compiled.textContent).not.toContain('Correo o contraseña incorrectos');
  });

  it('al salir del correo vacío se muestra "Ingresa tu correo electrónico"; si el formato no vale, "Ingresa un correo válido"; con más de 120 caracteres, "El correo no puede superar 120 caracteres"', async () => {
    blur('email');
    expect(compiled.textContent).toContain('Ingresa tu correo electrónico');

    await type('email', 'ana');
    blur('email');
    expect(compiled.textContent).toContain('Ingresa un correo válido');
    expect(compiled.textContent).not.toContain('Ingresa tu correo electrónico');

    await type('email', 'a'.repeat(121));
    blur('email');
    expect(compiled.textContent).toContain('El correo no puede superar 120 caracteres');
  });

  it('al salir de la contraseña vacía se muestra "Ingresa tu contraseña"; el campo la oculta y el ícono la muestra', async () => {
    const input = () => compiled.querySelector('#password') as HTMLInputElement;

    expect(input().type).toBe('password');
    expect(compiled.textContent).not.toContain('Ingresa tu contraseña');

    blur('password');
    expect(compiled.textContent).toContain('Ingresa tu contraseña');

    await type('password', 'Cafe2026*');
    expect(input().type).toBe('password');

    button('Mostrar contraseña').click();
    fixture.detectChanges();
    expect(input().type).toBe('text');
    expect(input().value).toBe('Cafe2026*');

    button('Ocultar contraseña').click();
    fixture.detectChanges();
    expect(input().type).toBe('password');
  });

  it('"¿Olvidaste tu contraseña?" muestra "Recuperar la contraseña se hará en otra historia."', () => {
    expect(compiled.textContent).not.toContain('Recuperar la contraseña se hará en otra historia.');

    button('¿Olvidaste tu contraseña?').click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Recuperar la contraseña se hará en otra historia.');
  });

  it('"Registra tu finca" abre el registro', () => {
    button('Registra tu finca').click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
  });

  it('ana@paraiso.com con Cafe2026* entra a Mis Lotes', async () => {
    await addFarm('demo-paraiso', 'ana@paraiso.com', 'Ana Morales', 'Finca El Paraíso');
    await type('email', 'ana@paraiso.com');
    await type('password', 'Cafe2026*');
    await submitUntil('/mis-lotes');

    expect(TestBed.inject(Router).url).toBe('/mis-lotes');
    expect(TestBed.inject(SessionService).account()?.ownerName).toBe('Ana Morales');
  });

  it('ana@paraiso.com con otra clave muestra "Correo o contraseña incorrectos"', async () => {
    await addFarm('demo-paraiso', 'ana@paraiso.com', 'Ana Morales', 'Finca El Paraíso');
    await type('email', 'ana@paraiso.com');
    await type('password', 'otra-clave');
    await submitUntilText('Correo o contraseña incorrectos');

    expect(compiled.textContent).toContain('Correo o contraseña incorrectos');
    expect(TestBed.inject(Router).url).toContain('/iniciar-sesion');
  });

  it('al quinto fallo seguido de ana@paraiso.com se muestra el bloqueo de 15 minutos; el intento correcto de pedro@elroble.com sigue entrando', async () => {
    await addFarm('demo-paraiso', 'ana@paraiso.com', 'Ana Morales', 'Finca El Paraíso');
    await addFarm('demo-roble', 'pedro@elroble.com', 'Pedro Castaño', 'Finca El Roble');
    await type('email', 'ana@paraiso.com');
    await type('password', 'otra-clave');

    for (let attempt = 0; attempt < 5; attempt++) {
      await submitFailure('ana@paraiso.com');
    }

    expect(compiled.textContent).toContain('15 minutos');
    expect(TestBed.inject(Router).url).toContain('/iniciar-sesion');

    await type('email', 'pedro@elroble.com');
    await type('password', 'Cafe2026*');
    await submitUntil('/mis-lotes');

    expect(TestBed.inject(Router).url).toBe('/mis-lotes');
    expect(TestBed.inject(SessionService).account()?.ownerName).toBe('Pedro Castaño');
  });

  it('con el correo y Cafe2026* de esa finca recién registrada se entra a Mis Lotes', async () => {
    await TestBed.inject(FarmRegistrationService).register({
      ...emptyFarmDraft({
        farmName: 'Finca Nueva',
        ownerName: 'Lucía Gómez',
        email: 'lucia@nueva.com',
      }),
      password: 'Cafe2026*',
    });
    await type('email', 'lucia@nueva.com');
    await type('password', 'Cafe2026*');
    await submitUntil('/mis-lotes');

    expect(TestBed.inject(Router).url).toBe('/mis-lotes');
    expect(TestBed.inject(SessionService).account()?.ownerName).toBe('Lucía Gómez');
  });
});
