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
  readonly varieties = signal<readonly string[]>([]);
  readonly coffeeVarieties = coffeeVarieties;
  readonly departments = departments;
  readonly municipalities = computed(
    () => municipalitiesByDepartment[this.department()] ?? [],
  );
  readonly areaValid = computed(() => {
    const value = this.area();
    return value === '' || /^[1-9]\d*$/.test(value);
  });

  onFarmNameInput(event: Event): void {
    this.farmName.set((event.target as HTMLInputElement).value);
  }

  onVillageInput(event: Event): void {
    this.village.set((event.target as HTMLInputElement).value);
  }

  onAreaInput(event: Event): void {
    this.area.set((event.target as HTMLInputElement).value);
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
    this.varieties.set([]);
    this.formOpen.set(false);
  }
}
