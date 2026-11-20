import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OriginRegistrationPage } from './origin-registration-page';

describe('Página de registro de origen', () => {
  let fixture: ComponentFixture<OriginRegistrationPage>;
  let compiled: HTMLElement;

  async function open(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [OriginRegistrationPage],
    }).compileComponents();

    fixture = TestBed.createComponent(OriginRegistrationPage);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  it('al abrir el formulario se ven el nombre, una sola variedad, el proceso, la descripción, el tueste, las notas, la altura, las evidencias, Guardar borrador y Publicar registro', async () => {
    await open();

    expect(label('Nombre del lote')).toBeTruthy();
    const variety = field('variedad') as HTMLSelectElement;
    expect(variety.multiple).toBe(false);
    expect(optionTexts(variety)).toEqual([
      'Castillo',
      'Caturra',
      'Geisha',
      'Bourbon',
      'Tabi',
      'Typica',
      'Colombia',
    ]);

    const process = field('proceso') as HTMLSelectElement;
    expect(optionTexts(process)).toEqual(['Lavado', 'Honey', 'Natural', 'Anaeróbico', 'Láctico']);
    expect(compiled.querySelector('textarea')?.getAttribute('placeholder')).toBe(
      'Describe el proceso (opcional)',
    );

    const roast = field('tueste') as HTMLSelectElement;
    expect(roast.multiple).toBe(false);
    expect(optionTexts(roast)).toEqual(['Claro / Ligero', 'Medio', 'Oscuro']);

    expect(label('Notas de cata')).toBeTruthy();
    expect(compiled.querySelector('#nota')?.getAttribute('placeholder')).toBe(
      'Escribe una nota y presiona Enter',
    );
    expect(label('Altura (m.s.n.m.)')).toBeTruthy();
    expect(label('Evidencias (JPG, PNG o PDF · máx. 5 MB)')).toBeTruthy();
    expect(compiled.querySelector('input[type="file"]')).toBeTruthy();
    expect(button('Guardar borrador')).toBeTruthy();
    expect(button('Publicar registro')).toBeTruthy();
  });

  function label(text: string): HTMLLabelElement | undefined {
    return [...compiled.querySelectorAll('label')].find((item) => item.textContent?.trim() === text);
  }

  function field(id: string): HTMLElement {
    const el = compiled.querySelector(`#${id}`);
    if (!el) {
      throw new Error(`#${id} not found`);
    }
    return el as HTMLElement;
  }

  function optionTexts(select: HTMLSelectElement): string[] {
    return [...select.options].map((option) => option.text).filter((text) => text !== 'Selecciona…');
  }

  function button(text: string): HTMLButtonElement | undefined {
    return [...compiled.querySelectorAll('button')].find((item) => item.textContent?.trim() === text);
  }
});
