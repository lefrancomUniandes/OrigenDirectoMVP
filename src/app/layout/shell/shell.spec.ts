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

  async function fillStep2Required(): Promise<void> {
    await typeOwnerName('Ana');
    await chooseDocumentType('Cédula de ciudadanía');
    await typeDocumentNumber('123');
    await typeEmail('ana@finca.com');
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

  it('Correo obligatorio; sin @ o sin dominio, Continuar sigue deshabilitado', async () => {
    await openForm();
    await goToStep2();
    await typeOwnerName('Ana');
    await chooseDocumentType('Cédula de ciudadanía');
    await typeDocumentNumber('123');

    expect(button('Continuar').disabled).toBe(true);

    await typeEmail('ana');
    expect(button('Continuar').disabled).toBe(true);

    await typeEmail('ana@finca');
    expect(button('Continuar').disabled).toBe(true);

    await typeEmail('ana@finca.com');
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
});
