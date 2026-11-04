import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

describe('Shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the application name', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shell__brand')?.textContent).toContain('OrigenDirecto');
  });

  it('muestra el botón Registrar finca en la barra', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const toolbar = fixture.nativeElement.querySelector('.shell__toolbar') as HTMLElement;
    const button = toolbar.querySelector('button');

    expect(button?.textContent).toContain('Registrar finca');
  });

  it('muestra el hero con el botón Comenzar registro', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const hero = compiled.querySelector('.hero');
    const button = [...(hero?.querySelectorAll('button') ?? [])].find((el) =>
      el.textContent?.includes('Comenzar registro'),
    );

    expect(hero).toBeTruthy();
    expect(button).toBeTruthy();
  });

  it('Registrar finca abre el modal del paso 1 con el campo nombre de la finca', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const registrar = compiled.querySelector('.shell__toolbar button') as HTMLButtonElement;

    registrar.click();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
    expect(dialog?.textContent).toContain('Nombre de la finca');
    expect(dialog?.querySelector('input')).toBeTruthy();
  });

  it('Comenzar registro abre el mismo modal', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const comenzar = [...compiled.querySelectorAll('.hero button')].find((el) =>
      el.textContent?.includes('Comenzar registro'),
    ) as HTMLButtonElement;

    comenzar.click();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
    expect(dialog?.textContent).toContain('Nombre de la finca');
    expect(dialog?.querySelector('input')).toBeTruthy();
  });

  it('Continuar permanece deshabilitado si el nombre está vacío', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const registrar = compiled.querySelector('.shell__toolbar button') as HTMLButtonElement;

    registrar.click();
    await fixture.whenStable();

    const continuar = [...compiled.querySelectorAll('[role="dialog"] button')].find((el) =>
      el.textContent?.includes('Continuar'),
    ) as HTMLButtonElement | undefined;

    expect(continuar?.disabled).toBe(true);
  });

  it('Continuar permanece deshabilitado si el nombre es solo espacios', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const registrar = compiled.querySelector('.shell__toolbar button') as HTMLButtonElement;

    registrar.click();
    await fixture.whenStable();

    const nombre = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    nombre.value = '   ';
    nombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const continuar = [...compiled.querySelectorAll('[role="dialog"] button')].find((el) =>
      el.textContent?.includes('Continuar'),
    ) as HTMLButtonElement | undefined;

    expect(continuar?.disabled).toBe(true);
  });

  it('Continuar se habilita cuando el nombre tiene texto válido', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const registrar = compiled.querySelector('.shell__toolbar button') as HTMLButtonElement;

    registrar.click();
    await fixture.whenStable();

    const nombre = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    nombre.value = 'Finca La Esperanza';
    nombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const continuar = [...compiled.querySelectorAll('[role="dialog"] button')].find((el) =>
      el.textContent?.includes('Continuar'),
    ) as HTMLButtonElement | undefined;

    expect(continuar?.disabled).toBe(false);
  });

  it('el contador refleja la longitud del nombre sobre 120 y el campo no acepta más de 120 caracteres', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const registrar = compiled.querySelector('.shell__toolbar button') as HTMLButtonElement;

    registrar.click();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const nombre = dialog.querySelector('input') as HTMLInputElement;

    expect(dialog.textContent).toContain('0/120');
    expect(nombre.maxLength).toBe(120);

    nombre.value = 'Finca';
    nombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialog.textContent).toContain('5/120');
  });

  it('si se confirma Cancelar, el modal se cierra y al volver a abrirlo el nombre está vacío', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const registrar = compiled.querySelector('.shell__toolbar button') as HTMLButtonElement;

    registrar.click();
    await fixture.whenStable();

    const nombre = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    nombre.value = 'Finca La Esperanza';
    nombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cancelar = [...compiled.querySelectorAll('[role="dialog"] button')].find((el) =>
      el.textContent?.includes('Cancelar'),
    ) as HTMLButtonElement;
    cancelar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();

    registrar.click();
    await fixture.whenStable();

    const nombreAlReabrir = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    expect(nombreAlReabrir.value).toBe('');

    vi.restoreAllMocks();
  });

  it('si se rechaza la confirmación de Cancelar, el modal sigue abierto con el nombre escrito', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const registrar = compiled.querySelector('.shell__toolbar button') as HTMLButtonElement;

    registrar.click();
    await fixture.whenStable();

    const nombre = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    nombre.value = 'Finca La Esperanza';
    nombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cancelar = [...compiled.querySelectorAll('[role="dialog"] button')].find((el) =>
      el.textContent?.includes('Cancelar'),
    ) as HTMLButtonElement;
    cancelar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]');
    const nombreTrasRechazo = dialog?.querySelector('input') as HTMLInputElement;

    expect(dialog).toBeTruthy();
    expect(nombreTrasRechazo.value).toBe('Finca La Esperanza');

    vi.restoreAllMocks();
  });
});
