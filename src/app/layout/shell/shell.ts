import { Component, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { coffeeVarieties } from '../../core/catalogs/coffee-varieties';
import { departments, municipalitiesByDepartment } from '../../core/catalogs/colombia';

@Component({
  imports: [MatToolbarModule, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  readonly formOpen = signal(false);
  readonly farmName = signal('');
  readonly department = signal('');
  readonly municipality = signal('');
  readonly village = signal('');
  readonly area = signal('');
  readonly altitude = signal('');
  readonly varieties = signal<readonly string[]>([]);
  readonly otherVariety = signal('');
  readonly coffeeVarieties = coffeeVarieties;
  readonly departments = departments;
  readonly municipalities = computed(
    () => municipalitiesByDepartment[this.department()] ?? [],
  );
  readonly areaValid = computed(() => {
    const value = this.area();
    return value === '' || /^[1-9]\d*$/.test(value);
  });
  readonly altitudeValid = computed(() => {
    const value = this.altitude();
    if (value === '') {
      return true;
    }
    if (!/^\d+$/.test(value)) {
      return false;
    }
    const meters = Number(value);
    return meters >= 500 && meters <= 2500;
  });
  readonly otherVarietySelected = computed(() => this.varieties().includes('Otro'));
  readonly otherVarietyValid = computed(
    () => !this.otherVarietySelected() || this.otherVariety().trim() !== '',
  );
  readonly canContinue = computed(
    () =>
      this.farmName().trim() !== '' &&
      this.department() !== '' &&
      this.municipality() !== '' &&
      this.varieties().length > 0 &&
      this.areaValid() &&
      this.altitudeValid() &&
      this.otherVarietyValid(),
  );

  onFarmNameInput(event: Event): void {
    this.farmName.set((event.target as HTMLInputElement).value);
  }

  onVillageInput(event: Event): void {
    this.village.set((event.target as HTMLInputElement).value);
  }

  onAreaInput(event: Event): void {
    this.area.set((event.target as HTMLInputElement).value);
  }

  onOtherVarietyInput(event: Event): void {
    this.otherVariety.set((event.target as HTMLInputElement).value);
  }

  onAltitudeInput(event: Event): void {
    this.altitude.set((event.target as HTMLInputElement).value);
  }

  onDepartmentChange(event: Event): void {
    this.department.set((event.target as HTMLSelectElement).value);
    this.municipality.set('');
  }

  onMunicipalityChange(event: Event): void {
    this.municipality.set((event.target as HTMLSelectElement).value);
  }

  onVarietyChange(name: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.varieties();
    this.varieties.set(
      checked ? [...current, name] : current.filter((variety) => variety !== name),
    );
  }

  cancel(): void {
    if (!confirm('¿Deseas cancelar el registro? Se perderá la información diligenciada.')) {
      return;
    }
    this.farmName.set('');
    this.department.set('');
    this.municipality.set('');
    this.village.set('');
    this.area.set('');
    this.altitude.set('');
    this.varieties.set([]);
    this.otherVariety.set('');
    this.formOpen.set(false);
  }
}
