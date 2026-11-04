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
});
