import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import Dexie from 'dexie';
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
import { hashPassword } from '../../core/auth/password-hash';
import { OrigenDirectoDb } from '../../core/db/origen-directo.db';
import { SessionService } from '../../core/session/session';
import { requireOwnFarm, requireSession } from '../../core/session/session-guard';
import { FarmRegistrationService } from '../../features/farm-registration/services/farm-registration.service';
import { LoginPage } from '../../features/login/pages/login-page';
import { Shell } from './shell';

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

@Component({ template: '' })
class PerfilPage {}

@Component({ template: '' })
class MisLotesPage {}

describe('Shell', () => {
  let fixture: ComponentFixture<Shell>;
  let compiled: HTMLElement;
  let registerFarm: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    localStorage.removeItem('od.session');
    localStorage.removeItem('od.login-attempts');
    registerFarm = vi.fn().mockResolvedValue('OD-2026-100001');
    await mount();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.inject(OrigenDirectoDb).close();
  });

  async function mount(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([
          { path: '', component: PerfilPage },
          { path: 'perfil/:id/editar', canActivate: [requireOwnFarm], component: PerfilPage },
          { path: 'perfil/:id', component: PerfilPage },
          { path: 'mis-lotes', canActivate: [requireSession], component: MisLotesPage },
          { path: 'iniciar-sesion', component: LoginPage },
        ]),
        { provide: FarmRegistrationService, useValue: { register: registerFarm } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function anaSession(): void {
    TestBed.inject(SessionService).start({
      farmId: 'demo-paraiso',
      ownerName: 'Ana Morales',
      farmName: 'Finca El Paraíso',
    });
    fixture.detectChanges();
  }

  async function settleFinish(): Promise<void> {
    for (let i = 0; i < 8; i++) {
      await Promise.resolve();
    }
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function confirmFinish(): Promise<void> {
    button('Finalizar').click();
    await settleFinish();
  }

  async function openForm(): Promise<void> {
    button('Registrar finca', compiled.querySelector('.shell__toolbar') ?? compiled).click();
    await fixture.whenStable();
  }

  function button(label: string, root: ParentNode = compiled): HTMLButtonElement {
    const found = [...root.querySelectorAll('button')].find((el) =>
      el.textContent?.includes(label),
    );
    if (!found) {
      throw new Error(`Button "${label}" not found`);
    }
    return found as HTMLButtonElement;
  }

  function link(label: string): HTMLAnchorElement {
    const found = [...compiled.querySelectorAll('a')].find((el) => el.textContent?.trim() === label);
    if (!found) {
      throw new Error(`Link "${label}" not found`);
    }
    return found;
  }

  async function untilUrl(url: string): Promise<void> {
    const router = TestBed.inject(Router);
    for (let attempt = 0; attempt < 50 && router.url !== url; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
    }
  }

  async function seedAna(): Promise<void> {
    await Dexie.delete('origen-directo');
    await TestBed.inject(OrigenDirectoDb).table('fincas').add({
      id: 'demo-paraiso',
      farmName: 'Finca El Paraíso',
      ownerName: 'Ana Morales',
      email: 'ana@paraiso.com',
      passwordHash: await hashPassword('Cafe2026*'),
      verified: true,
    });
  }

  async function typeFarmName(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#farmName') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeVillage(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#village') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeArea(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#area') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeOtherVariety(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#otherVariety') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeAltitude(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#altitude') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeOwnerName(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#ownerName') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function chooseDocumentType(value: string): Promise<HTMLSelectElement> {
    const documentType = compiled.querySelector('#documentType') as HTMLSelectElement;
    documentType.value = value;
    documentType.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    return documentType;
  }

  async function typeDocumentNumber(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#documentNumber') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeEmail(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#email') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  function departmentSelect(): HTMLSelectElement {
    return compiled.querySelector('#department') as HTMLSelectElement;
  }

  function municipalitySelect(): HTMLSelectElement {
    return compiled.querySelector('#municipality') as HTMLSelectElement;
  }

  async function chooseDepartment(value: string): Promise<HTMLSelectElement> {
    const department = departmentSelect();
    department.value = value;
    department.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    return department;
  }

  async function chooseMunicipality(value: string): Promise<HTMLSelectElement> {
    const municipality = municipalitySelect();
    municipality.value = value;
    municipality.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    return municipality;
  }

  async function chooseAreaUnit(value: string): Promise<HTMLSelectElement> {
    const areaUnit = compiled.querySelector('#areaUnit') as HTMLSelectElement;
    areaUnit.value = value;
    areaUnit.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    return areaUnit;
  }

  async function chooseVariety(name: string): Promise<void> {
    const checkbox = compiled.querySelector(
      `input[type="checkbox"][value="${name}"]`,
    ) as HTMLInputElement | null;
    if (!checkbox) {
      throw new Error(`Variety "${name}" not found`);
    }
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function fillStep1(): Promise<void> {
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Castillo');
  }

  async function goToStep2(): Promise<void> {
    await fillStep1();
    button('Continuar').click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function typePassword(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#password') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function fillStep2Required(): Promise<void> {
    await typeOwnerName('Ana');
    await chooseDocumentType('Cédula de ciudadanía');
    await typeDocumentNumber('123');
    await typeEmail('ana@finca.com');
    await typePassword('Cafe2026*');
  }

  async function goToStep3(documentType = 'Cédula de ciudadanía'): Promise<void> {
    await goToStep2();
    await typeOwnerName('Ana');
    await chooseDocumentType(documentType);
    await typeDocumentNumber('123');
    await typeEmail('ana@finca.com');
    await typePassword('Cafe2026*');
    button('Continuar').click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function photoFile(
    name: string,
    type = 'image/jpeg',
    size = 1024,
  ): File {
    return new File([new Uint8Array(size)], name, { type });
  }

  function pdfFile(name = 'nit.pdf', size = 1024, type = 'application/pdf'): File {
    return new File([new Uint8Array(size)], name, { type });
  }

  function fileListOf(files: File[]): FileList {
    const list = {
      length: files.length,
      item: (index: number) => files[index] ?? null,
      *[Symbol.iterator]() {
        yield* files;
      },
    };
    files.forEach((file, index) => {
      Object.assign(list, { [index]: file });
    });
    return list as unknown as FileList;
  }

  async function choosePhotos(files: File[], inputId = 'photos'): Promise<void> {
    const input = compiled.querySelector(`#${inputId}`) as HTMLInputElement;
    Object.defineProperty(input, 'files', { configurable: true, value: fileListOf(files) });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function typeMobile(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#mobile') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typePhoneAreaCode(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#phoneAreaCode') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeLandline(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#landline') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeBio(value: string): Promise<HTMLTextAreaElement> {
    const input = compiled.querySelector('#bio') as HTMLTextAreaElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  async function typeExperience(value: string): Promise<HTMLInputElement> {
    const input = compiled.querySelector('#experience') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return input;
  }

  it('el ícono de Origen Directo abre el inicio', () => {
    const brand = compiled.querySelector('.brand') as HTMLAnchorElement;

    expect(brand?.getAttribute('href')).toBe('/');
  });

  it('muestra el botón Registrar finca en la barra', async () => {
    const toolbar = compiled.querySelector('.shell__toolbar') as HTMLElement;

    expect(button('Registrar finca', toolbar)).toBeTruthy();
  });

  it('sin sesión, la cabecera muestra "Iniciar sesión" junto a "Registrar finca" y abre /iniciar-sesion', async () => {
    const actions = compiled.querySelector('.header__actions') as HTMLElement;
    const register = button('Registrar finca', actions);
    const login = register.nextElementSibling as HTMLAnchorElement | null;

    expect(login?.textContent?.trim()).toBe('Iniciar sesión');

    login?.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/iniciar-sesion');
  });

  it('con la sesión de Ana, la cabecera muestra "Ana Morales" y el menú "Mi perfil", "Mis lotes" y "Cerrar sesión"', () => {
    anaSession();
    button('Ana Morales').click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Ana Morales');
    expect(compiled.textContent).toContain('Mi perfil');
    expect(compiled.textContent).toContain('Mis lotes');
    expect(compiled.textContent).toContain('Cerrar sesión');
    expect(compiled.textContent).not.toContain('Iniciar sesión');
  });

  it('"Mi perfil" abre /perfil/demo-paraiso y "Mis lotes" abre /mis-lotes', async () => {
    anaSession();
    const router = TestBed.inject(Router);

    button('Ana Morales').click();
    fixture.detectChanges();
    link('Mi perfil').click();
    await fixture.whenStable();

    expect(router.url).toBe('/perfil/demo-paraiso');

    button('Ana Morales').click();
    fixture.detectChanges();
    link('Mis lotes').click();
    await fixture.whenStable();

    expect(router.url).toBe('/mis-lotes');
  });

  it('al recargar, la sesión de Ana sigue y la cabecera no vuelve a "Iniciar sesión"', async () => {
    anaSession();
    TestBed.resetTestingModule();
    await mount();

    expect(compiled.textContent).toContain('Ana Morales');
    expect(compiled.textContent).not.toContain('Iniciar sesión');
  });

  it('sin sesión, /mis-lotes abre /iniciar-sesion y, tras ingresar, vuelve a /mis-lotes', async () => {
    await seedAna();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/mis-lotes');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toContain('/iniciar-sesion');
    expect(router.url).toContain('returnUrl');

    await typeEmail('ana@paraiso.com');
    await typePassword('Cafe2026*');
    button('Ingresar').click();
    await untilUrl('/mis-lotes');

    expect(router.url).toBe('/mis-lotes');
  });

  it('sin sesión, editar el perfil de Ana abre /iniciar-sesion y, tras ingresar, vuelve a esa edición', async () => {
    await seedAna();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/perfil/demo-paraiso/editar');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toContain('/iniciar-sesion');
    expect(decodeURIComponent(router.url)).toContain('/perfil/demo-paraiso/editar');

    await typeEmail('ana@paraiso.com');
    await typePassword('Cafe2026*');
    button('Ingresar').click();
    await untilUrl('/perfil/demo-paraiso/editar');

    expect(router.url).toBe('/perfil/demo-paraiso/editar');
  });

  it('la página pública /perfil/demo-paraiso se abre sin sesión', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/perfil/demo-paraiso');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/perfil/demo-paraiso');
  });

  it('"Cerrar sesión" quita la sesión y vuelve al feed', async () => {
    anaSession();
    button('Ana Morales').click();
    fixture.detectChanges();
    button('Cerrar sesión').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/');
    expect(compiled.textContent).toContain('Iniciar sesión');
    expect(compiled.textContent).not.toContain('Ana Morales');
  });

  it('Registrar finca abre el modal del paso 1 con el campo nombre de la finca', async () => {
    await openForm();

    const dialog = compiled.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
    expect(dialog?.textContent).toContain('Nombre de la finca');
    expect(dialog?.querySelector('input')).toBeTruthy();
  });

  it('Continuar permanece deshabilitado si el nombre está vacío', async () => {
    await openForm();

    expect(button('Continuar').disabled).toBe(true);
  });

  it('Continuar permanece deshabilitado si el nombre es solo espacios', async () => {
    await openForm();
    await typeFarmName('   ');

    expect(button('Continuar').disabled).toBe(true);
  });

  it('el contador refleja la longitud del nombre sobre 120 y el campo no acepta más de 120 caracteres', async () => {
    await openForm();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const input = dialog.querySelector('input') as HTMLInputElement;

    expect(dialog.textContent).toContain('0/120');
    expect(input.maxLength).toBe(120);

    await typeFarmName('Finca');

    expect(dialog.textContent).toContain('5/120');
  });

  it('si se confirma Cancelar, el modal se cierra y al volver a abrirlo el nombre está vacío', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await openForm();
    await typeFarmName('Finca La Esperanza');

    button('Cancelar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();

    await openForm();

    const inputOnReopen = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    expect(inputOnReopen.value).toBe('');
  });

  it('si se rechaza la confirmación de Cancelar, el modal sigue abierto con el nombre escrito', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await openForm();
    await typeFarmName('Finca La Esperanza');

    button('Cancelar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]');
    const inputAfterReject = dialog?.querySelector('input') as HTMLInputElement;

    expect(dialog).toBeTruthy();
    expect(inputAfterReject.value).toBe('Finca La Esperanza');
  });

  it('el paso 1 muestra departamento, municipio, vereda, área con unidad, variedades y altitud', async () => {
    await openForm();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog.querySelector('label[for="department"]')?.textContent).toContain('Departamento');
    expect(dialog.querySelector('select#department')).toBeTruthy();
    expect(dialog.querySelector('label[for="municipality"]')?.textContent).toContain('Municipio');
    expect(dialog.querySelector('select#municipality')).toBeTruthy();
    expect(dialog.querySelector('label[for="village"]')?.textContent).toContain('Vereda o corregimiento');
    expect(dialog.querySelector('input#village')).toBeTruthy();
    expect(dialog.querySelector('label[for="area"]')?.textContent).toContain('Extensión o área total');
    expect(dialog.querySelector('input#area')).toBeTruthy();
    expect(dialog.querySelector('select#areaUnit')).toBeTruthy();
    expect(dialog.textContent).toContain('Variedades de café cultivadas');
    expect(dialog.querySelectorAll('input[type="checkbox"]').length).toBeGreaterThan(0);
    expect(dialog.querySelector('label[for="altitude"]')?.textContent).toContain('Altitud promedio');
    expect(dialog.querySelector('input#altitude')).toBeTruthy();
  });

  it('Municipio está deshabilitado hasta elegir departamento', async () => {
    await openForm();

    expect(municipalitySelect().disabled).toBe(true);

    await chooseDepartment('Huila');

    expect(municipalitySelect().disabled).toBe(false);
  });

  it('al elegir un departamento, municipio solo lista los de ese departamento', async () => {
    await openForm();
    await chooseDepartment('Huila');

    const options = [...municipalitySelect().options].map((option) => option.textContent?.trim());

    expect(options).toContain('Pitalito');
    expect(options).not.toContain('Medellín');
  });

  it('el departamento ofrece los 32 departamentos y Bogotá, D.C.', async () => {
    await openForm();

    const options = [...departmentSelect().options]
      .map((option) => option.textContent?.trim() ?? '')
      .filter((name) => name !== 'Selecciona…');

    expect(options).toEqual([
      'Amazonas',
      'Antioquia',
      'Arauca',
      'Archipiélago de San Andrés, Providencia y Santa Catalina',
      'Atlántico',
      'Bogotá, D.C.',
      'Bolívar',
      'Boyacá',
      'Caldas',
      'Caquetá',
      'Casanare',
      'Cauca',
      'Cesar',
      'Chocó',
      'Córdoba',
      'Cundinamarca',
      'Guainía',
      'Guaviare',
      'Huila',
      'La Guajira',
      'Magdalena',
      'Meta',
      'Nariño',
      'Norte de Santander',
      'Putumayo',
      'Quindío',
      'Risaralda',
      'Santander',
      'Sucre',
      'Tolima',
      'Valle del Cauca',
      'Vaupés',
      'Vichada',
    ]);
  });

  it('al elegir Huila, el municipio lista sus 37 municipios, entre ellos Neiva, Garzón y Pitalito', async () => {
    await openForm();
    await chooseDepartment('Huila');

    const options = [...municipalitySelect().options]
      .map((option) => option.textContent?.trim() ?? '')
      .filter((name) => name !== 'Selecciona…');

    expect(options).toEqual([
      'Acevedo',
      'Agrado',
      'Aipe',
      'Algeciras',
      'Altamira',
      'Baraya',
      'Campoalegre',
      'Colombia',
      'Elías',
      'Garzón',
      'Gigante',
      'Guadalupe',
      'Hobo',
      'Íquira',
      'Isnos',
      'La Argentina',
      'La Plata',
      'Nátaga',
      'Neiva',
      'Oporapa',
      'Paicol',
      'Palermo',
      'Palestina',
      'Pital',
      'Pitalito',
      'Rivera',
      'Saladoblanco',
      'San Agustín',
      'Santa María',
      'Suaza',
      'Tarqui',
      'Tello',
      'Teruel',
      'Tesalia',
      'Timaná',
      'Villavieja',
      'Yaguará',
    ]);
  });

  it('al elegir Antioquia, el municipio incluye Medellín y no incluye Pitalito', async () => {
    await openForm();
    await chooseDepartment('Antioquia');

    const options = [...municipalitySelect().options].map((option) => option.textContent?.trim());

    expect(options).toContain('Medellín');
    expect(options).not.toContain('Pitalito');
  });

  it('Continuar permanece deshabilitado si faltan departamento o municipio', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');

    expect(button('Continuar').disabled).toBe(true);

    await chooseDepartment('Huila');

    expect(button('Continuar').disabled).toBe(true);
  });

  it('Continuar permanece deshabilitado si no hay variedades', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');

    expect(button('Continuar').disabled).toBe(true);
  });

  it('Continuar se habilita con nombre, departamento, municipio y al menos una variedad', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Castillo');

    expect(button('Continuar').disabled).toBe(false);
  });

  it('Vereda es opcional, máximo 100 caracteres, con contador', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Castillo');

    const village = compiled.querySelector('#village') as HTMLInputElement;
    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(button('Continuar').disabled).toBe(false);
    expect(village.maxLength).toBe(100);
    expect(dialog.textContent).toContain('0/100');

    await typeVillage('Alto');

    expect(dialog.textContent).toContain('4/100');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Área vacía es válida; 0, decimales o texto no habilitan Continuar', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Castillo');

    expect(button('Continuar').disabled).toBe(false);

    await typeArea('0');
    expect(button('Continuar').disabled).toBe(true);

    await typeArea('12.5');
    expect(button('Continuar').disabled).toBe(true);

    await typeArea('abc');
    expect(button('Continuar').disabled).toBe(true);

    await typeArea('12');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('área en 0, con decimal o con letras muestra "Ingresa un entero mayor que 0"', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Castillo');

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog().textContent).not.toContain('Ingresa un entero mayor que 0');
    expect(button('Continuar').disabled).toBe(false);

    await typeArea('0');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Ingresa un entero mayor que 0');

    await typeArea('12.5');
    expect(dialog().textContent).toContain('Ingresa un entero mayor que 0');

    await typeArea('abc');
    expect(dialog().textContent).toContain('Ingresa un entero mayor que 0');

    await typeArea('');
    expect(dialog().textContent).not.toContain('Ingresa un entero mayor que 0');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('el selector de unidad ofrece Hectáreas y Fanegadas', async () => {
    await openForm();

    const options = [...compiled.querySelectorAll('#areaUnit option')].map((option) =>
      option.textContent?.trim(),
    );

    expect(options).toContain('Hectáreas');
    expect(options).toContain('Fanegadas');
  });

  it('al marcar Otro, aparece el campo extra; vacío o solo espacios dejan Continuar deshabilitado; texto de hasta 50 lo habilita', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');

    expect(compiled.querySelector('#otherVariety')).toBeNull();

    await chooseVariety('Otro');

    const otherVariety = compiled.querySelector('#otherVariety') as HTMLInputElement;
    expect(otherVariety).toBeTruthy();
    expect(otherVariety.maxLength).toBe(50);
    expect(button('Continuar').disabled).toBe(true);

    await typeOtherVariety('   ');
    expect(button('Continuar').disabled).toBe(true);

    await typeOtherVariety('Sidra');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('con Otro marcado y el campo vacío, se muestra "Indica la variedad"', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Otro');

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Indica la variedad');

    await typeOtherVariety('   ');
    expect(dialog().textContent).toContain('Indica la variedad');

    await typeOtherVariety('Sidra');
    expect(dialog().textContent).not.toContain('Indica la variedad');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Altitud vacía es válida; 499 y 2501 deshabilitan Continuar; 500 y 2500 lo dejan habilitado', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Castillo');

    expect(button('Continuar').disabled).toBe(false);

    await typeAltitude('499');
    expect(button('Continuar').disabled).toBe(true);

    await typeAltitude('500');
    expect(button('Continuar').disabled).toBe(false);

    await typeAltitude('2501');
    expect(button('Continuar').disabled).toBe(true);

    await typeAltitude('2500');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('altitud con letras o fuera de 500–2500 muestra "Entre 500 y 2500"', async () => {
    await openForm();
    await typeFarmName('Finca La Esperanza');
    await chooseDepartment('Huila');
    await chooseMunicipality('Pitalito');
    await chooseVariety('Castillo');

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog().textContent).not.toContain('Entre 500 y 2500');

    await typeAltitude('abc');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Entre 500 y 2500');

    await typeAltitude('499');
    expect(dialog().textContent).toContain('Entre 500 y 2500');

    await typeAltitude('2501');
    expect(dialog().textContent).toContain('Entre 500 y 2500');

    await typeAltitude('');
    expect(dialog().textContent).not.toContain('Entre 500 y 2500');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Continuar con el paso 1 válido muestra el paso 2 y Atrás; Cancelar sigue visible', async () => {
    await openForm();
    await fillStep1();

    button('Continuar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog.textContent).toContain('Datos básicos del usuario');
    expect(dialog.textContent).not.toContain('Datos básicos de la finca');
    expect(dialog.querySelector('#farmName')).toBeNull();
    expect(button('Atrás')).toBeTruthy();
    expect(button('Continuar')).toBeTruthy();
    expect(button('Cancelar')).toBeTruthy();
  });

  it('Atrás vuelve al paso 1 con los datos de la finca conservados', async () => {
    await openForm();
    await goToStep2();

    button('Atrás').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const farmName = compiled.querySelector('#farmName') as HTMLInputElement;

    expect(dialog.textContent).toContain('Datos básicos de la finca');
    expect(farmName.value).toBe('Finca La Esperanza');
    expect(municipalitySelect().value).toBe('Pitalito');
  });

  it('Nombre del usuario: obligatorio, no solo espacios, sin dígitos, máximo 120 con contador', async () => {
    await openForm();
    await goToStep2();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const ownerName = compiled.querySelector('#ownerName') as HTMLInputElement;

    expect(dialog.textContent).toContain('Nombre completo / Razón social');
    expect(ownerName.maxLength).toBe(120);
    expect(dialog.textContent).toContain('0/120');
    expect(button('Continuar').disabled).toBe(true);

    await typeOwnerName('   ');
    expect(button('Continuar').disabled).toBe(true);

    await typeOwnerName('Ana2');
    expect(button('Continuar').disabled).toBe(true);

    await typeOwnerName('Ana');
    expect(dialog.textContent).toContain('3/120');
  });

  it('un nombre con un dígito muestra "El nombre no admite números"', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog().textContent).not.toContain('El nombre no admite números');

    await typeOwnerName('Ana2');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('El nombre no admite números');

    await typeOwnerName('');
    expect(dialog().textContent).not.toContain('El nombre no admite números');

    await typeOwnerName('Ana');
    expect(dialog().textContent).not.toContain('El nombre no admite números');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Tipo de documento obligatorio; opciones NIT, RUT y cédulas y Pasaporte', async () => {
    await openForm();
    await goToStep2();
    await typeOwnerName('Ana');

    const documentType = compiled.querySelector('#documentType') as HTMLSelectElement;
    const options = [...documentType.options].map((option) => option.textContent?.trim());

    expect(options).toContain('NIT');
    expect(options).toContain('RUT');
    expect(options).toContain('Cédula de ciudadanía');
    expect(options).toContain('Cédula de extranjería');
    expect(options).toContain('Pasaporte');
    expect(button('Continuar').disabled).toBe(true);
  });

  it('Número de documento obligatorio; dígitos para cédula y letras y números para pasaporte', async () => {
    await openForm();
    await goToStep2();
    await typeOwnerName('Ana');
    await chooseDocumentType('Cédula de ciudadanía');

    expect(button('Continuar').disabled).toBe(true);

    await typeDocumentNumber('abc');
    expect(button('Continuar').disabled).toBe(true);

    await chooseDocumentType('Pasaporte');
    await typeDocumentNumber('AB 12');
    expect(button('Continuar').disabled).toBe(true);
  });

  it('un documento que no es solo dígitos muestra "Solo números"; en pasaporte, un espacio muestra "Solo letras y números"', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    await typeDocumentNumber('12a');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Solo números');
    expect(dialog().textContent).not.toContain('Solo letras y números');

    await chooseDocumentType('Pasaporte');
    await typeDocumentNumber('AB 12');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Solo letras y números');
  });

  it('Correo obligatorio; sin @ o sin dominio, Continuar sigue deshabilitado', async () => {
    await openForm();
    await goToStep2();
    await typeOwnerName('Ana');
    await chooseDocumentType('Cédula de ciudadanía');
    await typeDocumentNumber('123');
    await typePassword('Cafe2026*');

    expect(button('Continuar').disabled).toBe(true);

    await typeEmail('ana');
    expect(button('Continuar').disabled).toBe(true);

    await typeEmail('ana@finca');
    expect(button('Continuar').disabled).toBe(true);

    await typeEmail('ana@finca.com');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('un correo sin dominio muestra "Ingresa un correo válido"', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog().textContent).not.toContain('Ingresa un correo válido');

    await typeEmail('ana@finca');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Ingresa un correo válido');

    await typeEmail('ana');
    expect(dialog().textContent).toContain('Ingresa un correo válido');

    await typeEmail('ana@finca.com');
    expect(dialog().textContent).not.toContain('Ingresa un correo válido');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('en el paso del usuario, la contraseña es obligatoria, se oculta y tiene mostrar/ocultar; sin ella no se continúa', async () => {
    await openForm();
    await goToStep2();
    await typeOwnerName('Ana');
    await chooseDocumentType('Cédula de ciudadanía');
    await typeDocumentNumber('123');
    await typeEmail('ana@finca.com');

    const input = compiled.querySelector('#password') as HTMLInputElement;

    expect(input.type).toBe('password');
    expect(button('Continuar').disabled).toBe(true);

    button('Mostrar contraseña').click();
    fixture.detectChanges();
    expect((compiled.querySelector('#password') as HTMLInputElement).type).toBe('text');

    button('Ocultar contraseña').click();
    fixture.detectChanges();
    expect((compiled.querySelector('#password') as HTMLInputElement).type).toBe('password');

    await typePassword('Cafe2026*');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Celular vacío es válido; si se diligencia, solo numérico', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    expect(button('Continuar').disabled).toBe(false);

    await typeMobile('abc');
    expect(button('Continuar').disabled).toBe(true);

    await typeMobile('3001234567');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Indicativo municipal y teléfono vacíos son válidos; si se diligencian, solo numéricos', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    expect(button('Continuar').disabled).toBe(false);

    await typePhoneAreaCode('60a');
    expect(button('Continuar').disabled).toBe(true);

    await typePhoneAreaCode('604');
    await typeLandline('abc');
    expect(button('Continuar').disabled).toBe(true);

    await typeLandline('1234567');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('celular, indicativo o teléfono con letras muestra "Solo números"', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog().textContent).not.toContain('Solo números');

    await typeMobile('abc');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Solo números');

    await typeMobile('');
    expect(dialog().textContent).not.toContain('Solo números');
    expect(button('Continuar').disabled).toBe(false);

    await typePhoneAreaCode('60a');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Solo números');

    await typePhoneAreaCode('');
    expect(dialog().textContent).not.toContain('Solo números');

    await typeLandline('abc');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Solo números');

    await typeLandline('');
    expect(dialog().textContent).not.toContain('Solo números');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Biografía opcional: menos de 150 caracteres muestra la recomendación y no bloquea; máximo 500', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    const bio = compiled.querySelector('#bio') as HTMLTextAreaElement;
    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(bio.maxLength).toBe(500);
    expect(button('Continuar').disabled).toBe(false);

    await typeBio('Historia');
    expect(dialog.textContent).toContain('Recomendado mínimo 150 caracteres');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Años de experiencia vacíos son válidos; si se diligencian, entero ≥ 0', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    expect(button('Continuar').disabled).toBe(false);

    await typeExperience('1.5');
    expect(button('Continuar').disabled).toBe(true);

    await typeExperience('abc');
    expect(button('Continuar').disabled).toBe(true);

    await typeExperience('-1');
    expect(button('Continuar').disabled).toBe(true);

    await typeExperience('8');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('años de experiencia con letras muestran "Solo números enteros"', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    const dialog = () => compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog().textContent).not.toContain('Solo números enteros');

    await typeExperience('abc');
    expect(button('Continuar').disabled).toBe(true);
    expect(dialog().textContent).toContain('Solo números enteros');

    await typeExperience('1.5');
    expect(dialog().textContent).toContain('Solo números enteros');

    await typeExperience('');
    expect(dialog().textContent).not.toContain('Solo números enteros');
    expect(button('Continuar').disabled).toBe(false);
  });

  it('Continuar con el paso 2 válido muestra Documentación, zona de fotos, 0 de 5 y Enviar deshabilitado', async () => {
    await openForm();
    await goToStep2();
    await fillStep2Required();

    button('Continuar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const photos = compiled.querySelector('#photos') as HTMLInputElement;

    expect(dialog.textContent).toContain('Documentación');
    expect(dialog.textContent).toContain('Fotografías de la finca');
    expect(dialog.textContent).toContain('0 de 5 fotos');
    expect(photos).toBeTruthy();
    expect(photos.accept).toBe('.jpg,.jpeg,.png');
    expect(photos.multiple).toBe(true);
    expect(button('Atrás')).toBeTruthy();
    expect(button('Enviar').disabled).toBe(true);
    expect([...dialog.querySelectorAll('button')].some((el) => el.textContent?.includes('Continuar'))).toBe(
      false,
    );
  });

  it('un jpg, jpeg o png de hasta 5 MB se adjunta: miniatura, 1 de 5 fotos y Enviar habilitado', async () => {
    await openForm();
    await goToStep3();

    await choosePhotos([photoFile('finca.jpg')]);

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const thumbs = compiled.querySelectorAll('.thumbs img');

    expect(thumbs.length).toBe(1);
    expect(thumbs[0].getAttribute('alt')).toBe('Foto 1');
    expect(dialog.textContent).toContain('1 de 5 fotos');
    expect(button('Enviar').disabled).toBe(false);

    await choosePhotos([photoFile('otra.jpeg', 'image/jpeg'), photoFile('lote.png', 'image/png')]);

    expect(compiled.querySelectorAll('.thumbs img').length).toBe(3);
    expect(dialog.textContent).toContain('3 de 5 fotos');
  });

  it('un formato no soportado muestra alerta y no se adjunta', async () => {
    await openForm();
    await goToStep3();

    await choosePhotos([photoFile('notas.gif', 'image/gif')]);

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog.textContent).toContain(
      '"notas.gif" tiene un formato no soportado. Usa .jpg, .jpeg o .png.',
    );
    expect(compiled.querySelectorAll('.thumbs img').length).toBe(0);
    expect(dialog.textContent).toContain('0 de 5 fotos');
    expect(button('Enviar').disabled).toBe(true);
  });

  it('un archivo de más de 5 MB muestra alerta y no se adjunta', async () => {
    await openForm();
    await goToStep3();

    await choosePhotos([photoFile('grande.jpg', 'image/jpeg', 5 * 1024 * 1024 + 1)]);

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog.textContent).toContain('"grande.jpg" supera el peso máximo de 5 MB.');
    expect(compiled.querySelectorAll('.thumbs img').length).toBe(0);
    expect(button('Enviar').disabled).toBe(true);
  });

  it('la sexta foto muestra el máximo de 5 y no se adjunta', async () => {
    await openForm();
    await goToStep3();

    await choosePhotos([
      photoFile('1.jpg'),
      photoFile('2.jpg'),
      photoFile('3.jpg'),
      photoFile('4.jpg'),
      photoFile('5.jpg'),
    ]);
    await choosePhotos([photoFile('6.jpg')]);

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog.textContent).toContain('Solo puedes cargar un máximo de 5 fotografías.');
    expect(compiled.querySelectorAll('.thumbs img').length).toBe(5);
    expect(dialog.textContent).toContain('5 de 5 fotos');
  });

  it('Eliminar deja 0 fotos y deshabilita Enviar', async () => {
    await openForm();
    await goToStep3();
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    await choosePhotos([photoFile('finca.jpg')]);

    button('Eliminar').click();
    expect(revoke).toHaveBeenCalled();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(compiled.querySelectorAll('.thumbs img').length).toBe(0);
    expect(dialog.textContent).toContain('0 de 5 fotos');
    expect(button('Enviar').disabled).toBe(true);
  });

  it('Cambiar reemplaza la foto', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      (blob) => `blob:${(blob as File).name}`,
    );
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    expect(compiled.querySelector('.thumbs img')?.getAttribute('src')).toBe('blob:finca.jpg');

    const replaceInput = compiled.querySelector('#photoReplace') as HTMLInputElement;
    const openPicker = vi.spyOn(replaceInput, 'click');
    button('Cambiar').click();
    expect(openPicker).toHaveBeenCalled();
    fixture.detectChanges();
    await fixture.whenStable();
    await choosePhotos([photoFile('nueva.png', 'image/png')], 'photoReplace');

    expect(compiled.querySelectorAll('.thumbs img').length).toBe(1);
    expect(compiled.querySelector('.thumbs img')?.getAttribute('src')).toBe('blob:nueva.png');
    expect(button('Enviar').disabled).toBe(false);
  });

  it('arrastrar y soltar adjunta igual que el input', async () => {
    await openForm();
    await goToStep3();

    const dropzone = compiled.querySelector('#photoDrop') as HTMLElement;
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', {
      value: { files: fileListOf([photoFile('arrastre.jpg')]) },
    });
    dropzone.dispatchEvent(drop);
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(compiled.querySelectorAll('.thumbs img').length).toBe(1);
    expect(dialog.textContent).toContain('1 de 5 fotos');
    expect(button('Enviar').disabled).toBe(false);
  });

  it('con NIT o RUT el PDF es obligatorio: Enviar deshabilitado hasta adjuntar un PDF de ≤ 5 MB', async () => {
    await openForm();
    await goToStep3('NIT');
    await choosePhotos([photoFile('finca.jpg')]);

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const pdf = compiled.querySelector('#pdf') as HTMLInputElement;

    expect(dialog.textContent).toContain('Formato NIT vigente');
    expect(pdf).toBeTruthy();
    expect(pdf.accept).toContain('pdf');
    expect(button('Enviar').disabled).toBe(true);

    await choosePhotos([pdfFile()], 'pdf');

    expect(button('Enviar').disabled).toBe(false);
  });

  it('con cédula o pasaporte el PDF no aparece', async () => {
    await openForm();
    await goToStep3('Cédula de ciudadanía');
    await choosePhotos([photoFile('finca.jpg')]);

    expect(compiled.querySelector('#pdf')).toBeNull();
    expect(button('Enviar').disabled).toBe(false);

    button('Atrás').click();
    fixture.detectChanges();
    await fixture.whenStable();
    await chooseDocumentType('Pasaporte');
    button('Continuar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('#pdf')).toBeNull();
    expect(button('Enviar').disabled).toBe(false);
  });

  it('PDF inválido (no PDF o > 5 MB) muestra alerta y no se adjunta', async () => {
    await openForm();
    await goToStep3('NIT');
    await choosePhotos([photoFile('finca.jpg')]);

    await choosePhotos([photoFile('foto.jpg')], 'pdf');

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog.textContent).toContain('El archivo debe estar en formato PDF.');
    expect(button('Enviar').disabled).toBe(true);

    await choosePhotos([pdfFile('grande.pdf', 5 * 1024 * 1024 + 1)], 'pdf');

    expect(dialog.textContent).toContain('El PDF supera el peso máximo de 5 MB.');
    expect(button('Enviar').disabled).toBe(true);
  });

  it('PDF válido muestra el nombre y Quitar lo quita', async () => {
    await openForm();
    await goToStep3('RUT');
    await choosePhotos([photoFile('finca.jpg')]);
    await choosePhotos([pdfFile('rut-vigente.pdf')], 'pdf');

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog.textContent).toContain('rut-vigente.pdf');
    expect(button('Enviar').disabled).toBe(false);

    button('Quitar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialog.textContent).not.toContain('rut-vigente.pdf');
    expect(button('Enviar').disabled).toBe(true);
  });

  it('Enviar con el paso 3 válido abre el resumen de solo lectura, sin campos editables', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const summary = compiled.querySelector('#summary') as HTMLElement;

    expect(summary).toBeTruthy();
    expect(summary.textContent).toContain('Verifica tu información');
    expect(summary.textContent).toContain('Datos de la finca');
    expect(summary.textContent).toContain('Datos del usuario');
    expect(summary.querySelector('input')).toBeNull();
    expect(summary.querySelector('textarea')).toBeNull();
    expect(summary.querySelector('select')).toBeNull();
    expect(compiled.querySelector('#photos')).toBeNull();
    expect(compiled.querySelector('#farmName')).toBeNull();
    expect(button('Regresar al formulario')).toBeTruthy();
    expect(button('Finalizar')).toBeTruthy();
  });

  it('el resumen muestra los campos de finca y usuario, con — si están vacíos', async () => {
    await openForm();
    await fillStep1();
    await typeVillage('Alto');
    await typeArea('12');
    await chooseAreaUnit('Fanegadas');
    await typeAltitude('1600');
    button('Continuar').click();
    fixture.detectChanges();
    await fixture.whenStable();
    await typeOwnerName('Ana');
    await chooseDocumentType('Cédula de ciudadanía');
    await typeDocumentNumber('123');
    await typeEmail('ana@finca.com');
    await typePassword('Cafe2026*');
    await typeMobile('3001234567');
    await typePhoneAreaCode('604');
    await typeLandline('1234567');
    await typeBio('Historia');
    await typeExperience('8');
    button('Continuar').click();
    fixture.detectChanges();
    await fixture.whenStable();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const summary = compiled.querySelector('#summary') as HTMLElement;
    const text = summary.textContent ?? '';

    expect(text).toContain('Paso 1 · Datos de la finca');
    expect(text).toContain('Nombre de la finca');
    expect(text).toContain('Finca La Esperanza');
    expect(text).toContain('Departamento');
    expect(text).toContain('Huila');
    expect(text).toContain('Municipio');
    expect(text).toContain('Pitalito');
    expect(text).toContain('Vereda / corregimiento');
    expect(text).toContain('Alto');
    expect(text).toContain('Área total');
    expect(text).toContain('12 Fanegadas');
    expect(text).toContain('Variedades');
    expect(text).toContain('Castillo');
    expect(text).toContain('Altitud promedio');
    expect(text).toContain('1600 m.s.n.m.');
    expect(text).toContain('Paso 2 · Datos del usuario');
    expect(text).toContain('Nombre / Razón social');
    expect(text).toContain('Ana');
    expect(text).toContain('Documento');
    expect(text).toContain('Cédula de ciudadanía 123');
    expect(text).toContain('Correo');
    expect(text).toContain('ana@finca.com');
    expect(text).toContain('Celular');
    expect(text).toContain('3001234567');
    expect(text).toContain('Teléfono');
    expect(text).toContain('(604) 1234567');
    expect(text).toContain('Biografía');
    expect(text).toContain('Historia');
    expect(text).toContain('Años de experiencia');
    expect(text).toContain('8');
  });

  it('el resumen muestra — en vereda, área, altitud, celular, teléfono, biografía y experiencia si van vacíos', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const rows = [...compiled.querySelectorAll('#summary dt')].map((dt) => ({
      label: dt.textContent?.trim(),
      value: dt.nextElementSibling?.textContent?.trim(),
    }));

    expect(rows).toContainEqual({ label: 'Vereda / corregimiento', value: '—' });
    expect(rows).toContainEqual({ label: 'Área total', value: '—' });
    expect(rows).toContainEqual({ label: 'Altitud promedio', value: '—' });
    expect(rows).toContainEqual({ label: 'Celular', value: '—' });
    expect(rows).toContainEqual({ label: 'Teléfono', value: '—' });
    expect(rows).toContainEqual({ label: 'Biografía', value: '—' });
    expect(rows).toContainEqual({ label: 'Años de experiencia', value: '—' });
  });

  it('Regresar al formulario vuelve al paso 3 con fotos y datos conservados', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    button('Regresar al formulario').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;

    expect(compiled.querySelector('#summary')).toBeNull();
    expect(dialog.textContent).toContain('Documentación');
    expect(dialog.textContent).toContain('1 de 5 fotos');
    expect(compiled.querySelectorAll('.thumbs img').length).toBe(1);
    expect(button('Enviar').disabled).toBe(false);
  });

  it('Finalizar muestra el popup con número OD-año-###### y el texto de 8 días hábiles', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    await confirmFinish();

    const success = compiled.querySelector('#success') as HTMLElement;

    expect(compiled.querySelector('#summary')).toBeNull();
    expect(success).toBeTruthy();
    expect(success.textContent).toContain('¡Solicitud enviada!');
    expect(success.textContent).toMatch(/OD-\d{4}-\d{6}/);
    expect(success.textContent).toContain('8 días hábiles');
    expect(button('Entendido')).toBeTruthy();
  });

  it('Finalizar muestra el número que devolvió el servicio', async () => {
    registerFarm.mockResolvedValue('OD-2026-654321');
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    await confirmFinish();

    const success = compiled.querySelector('#success') as HTMLElement;

    expect(registerFarm).toHaveBeenCalledWith(
      expect.objectContaining({
        farmName: 'Finca La Esperanza',
        department: 'Huila',
        municipality: 'Pitalito',
        varieties: ['Castillo'],
        ownerName: 'Ana',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '123',
        email: 'ana@finca.com',
        areaUnit: 'Hectáreas',
      }),
    );
    const payload = registerFarm.mock.calls[0][0];
    expect(payload.photos).toEqual([
      expect.objectContaining({
        name: 'finca.jpg',
        type: 'image/jpeg',
        bytes: expect.any(ArrayBuffer),
      }),
    ]);
    expect(payload.pdf).toBeNull();
    expect(success.textContent).toContain('OD-2026-654321');
  });

  it('Finalizar no envía dos veces si se pulsa de nuevo mientras guarda', async () => {
    let resolveRegister!: (id: string) => void;
    registerFarm.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveRegister = resolve;
      }),
    );
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);
    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    button('Finalizar').click();
    button('Finalizar').click();
    await settleFinish();

    expect(registerFarm).toHaveBeenCalledTimes(1);

    resolveRegister('OD-2026-100001');
    await settleFinish();

    expect(compiled.querySelector('#success')).toBeTruthy();
  });

  it('si guardar falla, el resumen sigue abierto con un mensaje y se puede reintentar', async () => {
    registerFarm.mockRejectedValueOnce(new Error('quota'));
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);
    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    await confirmFinish();

    const summary = compiled.querySelector('#summary') as HTMLElement;
    expect(summary).toBeTruthy();
    expect(compiled.querySelector('#success')).toBeNull();
    expect(summary.textContent).toContain('No se pudo guardar la solicitud. Intenta de nuevo.');
    expect(button('Finalizar').disabled).toBe(false);

    registerFarm.mockResolvedValueOnce('OD-2026-100001');
    await confirmFinish();

    expect(compiled.querySelector('#summary')).toBeNull();
    expect(compiled.querySelector('#success')?.textContent).toContain('OD-2026-100001');
  });

  it('Entendido cierra el popup y el formulario', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    await confirmFinish();

    button('Entendido').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('#success')).toBeNull();
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();

    await openForm();

    const farmName = compiled.querySelector('#farmName') as HTMLInputElement;
    expect(farmName.value).toBe('');
  });

  it('sin login no está «Mis lotes»', () => {
    expect(compiled.textContent).not.toContain('Mis lotes');
  });

  it('con la sesión iniciada, «Mis lotes» abre /mis-lotes', async () => {
    anaSession();
    const router = TestBed.inject(Router);
    button('Ana Morales').click();
    fixture.detectChanges();
    link('Mis lotes').click();
    await fixture.whenStable();

    expect(router.url).toBe('/mis-lotes');
  });

  it('«Entendido» abre /perfil/<número>', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    await confirmFinish();

    button('Entendido').click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/perfil/OD-2026-100001');
  });
});
