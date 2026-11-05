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
  readonly step = signal(1);
  readonly farmName = signal('');
  readonly department = signal('');
  readonly municipality = signal('');
  readonly village = signal('');
  readonly area = signal('');
  readonly altitude = signal('');
  readonly varieties = signal<readonly string[]>([]);
  readonly otherVariety = signal('');
  readonly ownerName = signal('');
  readonly documentType = signal('');
  readonly documentNumber = signal('');
  readonly email = signal('');
  readonly mobile = signal('');
  readonly phoneAreaCode = signal('');
  readonly landline = signal('');
  readonly bio = signal('');
  readonly experience = signal('');
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
  readonly ownerNameValid = computed(() => {
    const value = this.ownerName();
    return value.trim() !== '' && !/\d/.test(value);
  });
  readonly step1Valid = computed(
    () =>
      this.farmName().trim() !== '' &&
      this.department() !== '' &&
      this.municipality() !== '' &&
      this.varieties().length > 0 &&
      this.areaValid() &&
      this.altitudeValid() &&
      this.otherVarietyValid(),
  );
  readonly documentNumberValid = computed(() => {
    const value = this.documentNumber();
    if (value === '') {
      return false;
    }
    if (this.documentType() === 'Pasaporte') {
      return /^[A-Za-z0-9]+$/.test(value);
    }
    return /^\d+$/.test(value);
  });
  readonly emailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(this.email()),
  );
  readonly mobileValid = computed(() => {
    const value = this.mobile();
    return value === '' || /^\d+$/.test(value);
  });
  readonly phoneAreaCodeValid = computed(() => {
    const value = this.phoneAreaCode();
    return value === '' || /^\d+$/.test(value);
  });
  readonly landlineValid = computed(() => {
    const value = this.landline();
    return value === '' || /^\d+$/.test(value);
  });
  readonly bioHintVisible = computed(() => {
    const length = this.bio().length;
    return length > 0 && length < 150;
  });
  readonly experienceValid = computed(() => {
    const value = this.experience();
    return value === '' || /^\d+$/.test(value);
  });
  readonly step2Valid = computed(
    () =>
      this.ownerNameValid() &&
      this.documentType() !== '' &&
      this.documentNumberValid() &&
      this.emailValid() &&
      this.mobileValid() &&
      this.phoneAreaCodeValid() &&
      this.landlineValid() &&
      this.experienceValid(),
  );
  readonly canContinue = computed(() =>
    this.step() === 1 ? this.step1Valid() : this.step2Valid(),
  );

  onFarmNameInput(event: Event): void {
    this.farmName.set((event.target as HTMLInputElement).value);
  }

  onOwnerNameInput(event: Event): void {
    this.ownerName.set((event.target as HTMLInputElement).value);
  }

  onDocumentTypeChange(event: Event): void {
    this.documentType.set((event.target as HTMLSelectElement).value);
  }

  onDocumentNumberInput(event: Event): void {
    this.documentNumber.set((event.target as HTMLInputElement).value);
  }

  onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  onMobileInput(event: Event): void {
    this.mobile.set((event.target as HTMLInputElement).value);
  }

  onPhoneAreaCodeInput(event: Event): void {
    this.phoneAreaCode.set((event.target as HTMLInputElement).value);
  }

  onLandlineInput(event: Event): void {
    this.landline.set((event.target as HTMLInputElement).value);
  }

  onBioInput(event: Event): void {
    this.bio.set((event.target as HTMLTextAreaElement).value);
  }

  onExperienceInput(event: Event): void {
    this.experience.set((event.target as HTMLInputElement).value);
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

  goNext(): void {
    this.step.update((step) => step + 1);
  }

  goBack(): void {
    this.step.update((step) => Math.max(1, step - 1));
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
    this.ownerName.set('');
    this.documentType.set('');
    this.documentNumber.set('');
    this.email.set('');
    this.mobile.set('');
    this.phoneAreaCode.set('');
    this.landline.set('');
    this.bio.set('');
    this.experience.set('');
    this.step.set(1);
    this.formOpen.set(false);
  }
}
