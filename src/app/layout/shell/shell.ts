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
  readonly photos = signal<readonly { file: File; url: string }[]>([]);
  readonly photoAlert = signal('');
  readonly photoReplaceIndex = signal<number | null>(null);
  readonly pdf = signal<File | null>(null);
  readonly pdfAlert = signal('');
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
  readonly pdfRequired = computed(() => ['NIT', 'RUT'].includes(this.documentType()));
  readonly canSubmit = computed(
    () => this.photos().length > 0 && (!this.pdfRequired() || this.pdf() !== null),
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

  onPhotosChange(event: Event): void {
    this.addPhotos([...((event.target as HTMLInputElement).files ?? [])]);
  }

  onPhotoDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onPhotoDrop(event: DragEvent): void {
    event.preventDefault();
    this.addPhotos([...(event.dataTransfer?.files ?? [])]);
  }

  addPhotos(files: File[]): void {
    const errors: string[] = [];
    const accepted: { file: File; url: string }[] = [];
    for (const file of files) {
      if (this.photos().length + accepted.length >= 5) {
        errors.push('Solo puedes cargar un máximo de 5 fotografías.');
        break;
      }
      if (
        !['image/jpeg', 'image/png'].includes(file.type) ||
        !/\.(jpe?g|png)$/i.test(file.name)
      ) {
        errors.push(`"${file.name}" tiene un formato no soportado. Usa .jpg, .jpeg o .png.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`"${file.name}" supera el peso máximo de 5 MB.`);
        continue;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    this.photoAlert.set(errors.join(' '));
    this.photos.set([...this.photos(), ...accepted]);
  }

  removePhoto(index: number): void {
    this.photos.set(this.photos().filter((_, current) => current !== index));
    this.photoAlert.set('');
  }

  startReplacePhoto(index: number): void {
    this.photoReplaceIndex.set(index);
  }

  onPdfChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      this.pdfAlert.set('El archivo debe estar en formato PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.pdfAlert.set('El PDF supera el peso máximo de 5 MB.');
      return;
    }
    this.pdf.set(file);
    this.pdfAlert.set('');
  }

  removePdf(): void {
    this.pdf.set(null);
    this.pdfAlert.set('');
  }

  onPhotoReplaceChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const index = this.photoReplaceIndex();
    if (!file || index === null) {
      return;
    }
    if (
      !['image/jpeg', 'image/png'].includes(file.type) ||
      !/\.(jpe?g|png)$/i.test(file.name)
    ) {
      this.photoAlert.set(`"${file.name}" tiene un formato no soportado. Usa .jpg, .jpeg o .png.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.photoAlert.set(`"${file.name}" supera el peso máximo de 5 MB.`);
      return;
    }
    const next = [...this.photos()];
    next[index] = { file, url: URL.createObjectURL(file) };
    this.photos.set(next);
    this.photoAlert.set('');
    this.photoReplaceIndex.set(null);
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
