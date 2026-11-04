import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

describe('Shell', () => {
  let fixture: ComponentFixture<Shell>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function abrirFormulario(desde: 'barra' | 'hero' = 'barra'): Promise<void> {
    if (desde === 'hero') {
      boton('Comenzar registro', compiled.querySelector('.hero') ?? compiled).click();
    } else {
      boton('Registrar finca', compiled.querySelector('.shell__toolbar') ?? compiled).click();
    }
    await fixture.whenStable();
  }

  function boton(texto: string, raiz: ParentNode = compiled): HTMLButtonElement {
    const encontrado = [...raiz.querySelectorAll('button')].find((el) =>
      el.textContent?.includes(texto),
    );
    if (!encontrado) {
      throw new Error(`No se encontró el botón "${texto}"`);
    }
    return encontrado as HTMLButtonElement;
  }

  async function escribirNombre(valor: string): Promise<HTMLInputElement> {
    const nombre = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    nombre.value = valor;
    nombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    return nombre;
  }

  it('muestra el botón Registrar finca en la barra', async () => {
    const toolbar = compiled.querySelector('.shell__toolbar') as HTMLElement;

    expect(boton('Registrar finca', toolbar)).toBeTruthy();
  });

  it('muestra el hero con el botón Comenzar registro', async () => {
    const hero = compiled.querySelector('.hero');

    expect(hero).toBeTruthy();
    expect(boton('Comenzar registro', hero ?? compiled)).toBeTruthy();
  });

  it('Registrar finca abre el modal del paso 1 con el campo nombre de la finca', async () => {
    await abrirFormulario();

    const dialog = compiled.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
    expect(dialog?.textContent).toContain('Nombre de la finca');
    expect(dialog?.querySelector('input')).toBeTruthy();
  });

  it('Comenzar registro abre el mismo modal', async () => {
    await abrirFormulario('hero');

    const dialog = compiled.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
    expect(dialog?.textContent).toContain('Nombre de la finca');
    expect(dialog?.querySelector('input')).toBeTruthy();
  });

  it('Continuar permanece deshabilitado si el nombre está vacío', async () => {
    await abrirFormulario();

    expect(boton('Continuar').disabled).toBe(true);
  });

  it('Continuar permanece deshabilitado si el nombre es solo espacios', async () => {
    await abrirFormulario();
    await escribirNombre('   ');

    expect(boton('Continuar').disabled).toBe(true);
  });

  it('Continuar se habilita cuando el nombre tiene texto válido', async () => {
    await abrirFormulario();
    await escribirNombre('Finca La Esperanza');

    expect(boton('Continuar').disabled).toBe(false);
  });

  it('el contador refleja la longitud del nombre sobre 120 y el campo no acepta más de 120 caracteres', async () => {
    await abrirFormulario();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const nombre = dialog.querySelector('input') as HTMLInputElement;

    expect(dialog.textContent).toContain('0/120');
    expect(nombre.maxLength).toBe(120);

    await escribirNombre('Finca');

    expect(dialog.textContent).toContain('5/120');
  });

  it('si se confirma Cancelar, el modal se cierra y al volver a abrirlo el nombre está vacío', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await abrirFormulario();
    await escribirNombre('Finca La Esperanza');

    boton('Cancelar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();

    await abrirFormulario();

    const nombreAlReabrir = compiled.querySelector('[role="dialog"] input') as HTMLInputElement;
    expect(nombreAlReabrir.value).toBe('');
  });

  it('si se rechaza la confirmación de Cancelar, el modal sigue abierto con el nombre escrito', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await abrirFormulario();
    await escribirNombre('Finca La Esperanza');

    boton('Cancelar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector('[role="dialog"]');
    const nombreTrasRechazo = dialog?.querySelector('input') as HTMLInputElement;

    expect(dialog).toBeTruthy();
    expect(nombreTrasRechazo.value).toBe('Finca La Esperanza');
  });
});
