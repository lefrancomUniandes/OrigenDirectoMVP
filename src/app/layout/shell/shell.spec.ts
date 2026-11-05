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

  async function goToStep3(documentType = 'Cédula de ciudadanía'): Promise<void> {
    await goToStep2();
    await typeOwnerName('Ana');
    await chooseDocumentType(documentType);
    await typeDocumentNumber('123');
    await typeEmail('ana@finca.com');
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
    await choosePhotos([photoFile('finca.jpg')]);

    button('Eliminar').click();
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

    button('Cambiar').click();
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
    expect(button('Regresar al formulario')).toBeTruthy();
    expect(button('Finalizar')).toBeTruthy();
  });

  it('el resumen muestra los datos diligenciados de finca, municipio, dueño y correo', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const summary = compiled.querySelector('#summary') as HTMLElement;

    expect(summary.textContent).toContain('Finca La Esperanza');
    expect(summary.textContent).toContain('Pitalito');
    expect(summary.textContent).toContain('Ana');
    expect(summary.textContent).toContain('ana@finca.com');
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

    button('Finalizar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const success = compiled.querySelector('#success') as HTMLElement;

    expect(compiled.querySelector('#summary')).toBeNull();
    expect(success).toBeTruthy();
    expect(success.textContent).toContain('¡Solicitud enviada!');
    expect(success.textContent).toMatch(/OD-\d{4}-\d{6}/);
    expect(success.textContent).toContain('8 días hábiles');
    expect(button('Entendido')).toBeTruthy();
  });

  it('Entendido cierra el popup y el formulario', async () => {
    await openForm();
    await goToStep3();
    await choosePhotos([photoFile('finca.jpg')]);

    button('Enviar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    button('Finalizar').click();
    fixture.detectChanges();
    await fixture.whenStable();

    button('Entendido').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('#success')).toBeNull();
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();

    await openForm();

    const farmName = compiled.querySelector('#farmName') as HTMLInputElement;
    expect(farmName.value).toBe('');
  });
});
