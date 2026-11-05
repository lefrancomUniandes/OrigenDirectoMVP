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

  async function openForm(from: 'toolbar' | 'hero' = 'toolbar'): Promise<void> {
    if (from === 'hero') {
      button('Comenzar registro', compiled.querySelector('.hero') ?? compiled).click();
    } else {
      button('Registrar finca', compiled.querySelector('.shell__toolbar') ?? compiled).click();
    }
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

  it('muestra el botón Registrar finca en la barra', async () => {
    const toolbar = compiled.querySelector('.shell__toolbar') as HTMLElement;

    expect(button('Registrar finca', toolbar)).toBeTruthy();
  });

  it('muestra el hero con el botón Comenzar registro', async () => {
    const hero = compiled.querySelector('.hero');

    expect(hero).toBeTruthy();
    expect(button('Comenzar registro', hero ?? compiled)).toBeTruthy();
  });

  it('Registrar finca abre el modal del paso 1 con el campo nombre de la finca', async () => {
    await openForm();

    const dialog = compiled.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Datos básicos de la finca');
    expect(dialog?.textContent).toContain('Nombre de la finca');
    expect(dialog?.querySelector('input')).toBeTruthy();
  });

  it('Comenzar registro abre el mismo modal', async () => {
    await openForm('hero');

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
});
