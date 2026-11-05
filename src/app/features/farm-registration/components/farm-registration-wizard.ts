import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { coffeeVarieties } from '../../../core/catalogs/coffee-varieties';
import { departments, municipalitiesByDepartment } from '../../../core/catalogs/colombia';
import { FarmRegistrationService } from '../services/farm-registration.service';
import { emptyWizardForm, WizardForm, WizardPhoto } from './wizard-form';

@Component({
  selector: 'app-farm-registration-wizard',
  styleUrl: './farm-registration-wizard.scss',
  templateUrl: './farm-registration-wizard.html',
})
export class FarmRegistrationWizard {
  private readonly farmRegistration = inject(FarmRegistrationService);
  readonly closed = output<void>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.resetForm());
  }
  readonly form = signal<WizardForm>(emptyWizardForm);
  readonly coffeeVarieties = coffeeVarieties;
  readonly departments = departments;
  readonly municipalities = computed(
    () => municipalitiesByDepartment[this.form().department] ?? [],
  );
  readonly areaValid = computed(() => {
    const value = this.form().area;
    return value === '' || /^[1-9]\d*$/.test(value);
  });
  readonly altitudeValid = computed(() => {
    const value = this.form().altitude;
    if (value === '') {
      return true;
    }
    if (!/^\d+$/.test(value)) {
      return false;
    }
    const meters = Number(value);
    return meters >= 500 && meters <= 2500;
  });
  readonly otherVarietySelected = computed(() => this.form().varieties.includes('Otro'));
  readonly otherVarietyValid = computed(
    () => !this.otherVarietySelected() || this.form().otherVariety.trim() !== '',
  );
  readonly ownerNameValid = computed(() => {
    const value = this.form().ownerName;
    return value.trim() !== '' && !/\d/.test(value);
  });
  readonly step1Valid = computed(
    () =>
      this.form().farmName.trim() !== '' &&
      this.form().department !== '' &&
      this.form().municipality !== '' &&
      this.form().varieties.length > 0 &&
      this.areaValid() &&
      this.altitudeValid() &&
      this.otherVarietyValid(),
  );
  readonly documentNumberValid = computed(() => {
    const value = this.form().documentNumber;
    if (value === '') {
      return false;
    }
    if (this.form().documentType === 'Pasaporte') {
      return /^[A-Za-z0-9]+$/.test(value);
    }
    return /^\d+$/.test(value);
  });
  readonly emailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(this.form().email),
  );
  readonly mobileValid = computed(() => {
    const value = this.form().mobile;
    return value === '' || /^\d+$/.test(value);
  });
  readonly phoneAreaCodeValid = computed(() => {
    const value = this.form().phoneAreaCode;
    return value === '' || /^\d+$/.test(value);
  });
  readonly landlineValid = computed(() => {
    const value = this.form().landline;
    return value === '' || /^\d+$/.test(value);
  });
  readonly bioHintVisible = computed(() => {
    const length = this.form().bio.length;
    return length > 0 && length < 150;
  });
  readonly experienceValid = computed(() => {
    const value = this.form().experience;
    return value === '' || /^\d+$/.test(value);
  });
  readonly step2Valid = computed(
    () =>
      this.ownerNameValid() &&
      this.form().documentType !== '' &&
      this.documentNumberValid() &&
      this.emailValid() &&
      this.mobileValid() &&
      this.phoneAreaCodeValid() &&
      this.landlineValid() &&
      this.experienceValid(),
  );
  readonly canContinue = computed(() =>
    this.form().step === 1 ? this.step1Valid() : this.step2Valid(),
  );
  readonly pdfRequired = computed(() => ['NIT', 'RUT'].includes(this.form().documentType));
  readonly canSubmit = computed(
    () => this.form().photos.length > 0 && (!this.pdfRequired() || this.form().pdf !== null),
  );
  readonly summaryVarieties = computed(() => {
    const names = this.form().varieties.map((name) =>
      name === 'Otro' ? `Otro: ${this.form().otherVariety}` : name,
    );
    return names.join(', ') || '—';
  });
  readonly summaryArea = computed(() => {
    const value = this.form().area.trim();
    return value === '' ? '—' : `${value} ${this.form().areaUnit}`;
  });
  readonly summaryAltitude = computed(() => {
    const value = this.form().altitude.trim();
    return value === '' ? '—' : `${value} m.s.n.m.`;
  });
  readonly summaryDocument = computed(
    () => `${this.form().documentType} ${this.form().documentNumber}`.trim() || '—',
  );
  readonly summaryPhone = computed(() => {
    const landline = this.form().landline.trim();
    if (landline === '') {
      return '—';
    }
    const code = this.form().phoneAreaCode.trim();
    return code === '' ? landline : `(${code}) ${landline}`;
  });

  private patch(changes: Partial<WizardForm>): void {
    this.form.update((current) => ({ ...current, ...changes }));
  }

  onText(
    field: keyof Pick<
      WizardForm,
      | 'farmName'
      | 'village'
      | 'area'
      | 'altitude'
      | 'otherVariety'
      | 'ownerName'
      | 'documentNumber'
      | 'email'
      | 'mobile'
      | 'phoneAreaCode'
      | 'landline'
      | 'experience'
    >,
    event: Event,
  ): void {
    this.patch({ [field]: (event.target as HTMLInputElement).value });
  }

  onBioInput(event: Event): void {
    this.patch({ bio: (event.target as HTMLTextAreaElement).value });
  }

  openFilePicker(id: string): void {
    document.getElementById(id)?.click();
  }

  onPhotosChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addPhotos([...(input.files ?? [])]);
    input.value = '';
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
    const accepted: WizardPhoto[] = [];
    for (const file of files) {
      if (this.form().photos.length + accepted.length >= 5) {
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
    this.patch({
      photoAlert: errors.join(' '),
      photos: [...this.form().photos, ...accepted],
    });
  }

  removePhoto(index: number): void {
    const current = this.form().photos[index];
    if (current) {
      URL.revokeObjectURL(current.url);
    }
    this.patch({
      photos: this.form().photos.filter((_, position) => position !== index),
      photoAlert: '',
    });
    const input = document.getElementById('photos') as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }

  startReplacePhoto(index: number): void {
    this.patch({ photoReplaceIndex: index });
    document.getElementById('photoReplace')?.click();
  }

  onPdfChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      this.patch({ pdfAlert: 'El archivo debe estar en formato PDF.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.patch({ pdfAlert: 'El PDF supera el peso máximo de 5 MB.' });
      return;
    }
    this.patch({ pdf: file, pdfAlert: '' });
  }

  removePdf(): void {
    this.patch({ pdf: null, pdfAlert: '' });
  }

  onPhotoReplaceChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const index = this.form().photoReplaceIndex;
    if (!file || index === null) {
      return;
    }
    if (
      !['image/jpeg', 'image/png'].includes(file.type) ||
      !/\.(jpe?g|png)$/i.test(file.name)
    ) {
      this.patch({
        photoAlert: `"${file.name}" tiene un formato no soportado. Usa .jpg, .jpeg o .png.`,
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.patch({ photoAlert: `"${file.name}" supera el peso máximo de 5 MB.` });
      return;
    }
    const next = [...this.form().photos];
    if (next[index]) {
      URL.revokeObjectURL(next[index].url);
    }
    next[index] = { file, url: URL.createObjectURL(file) };
    this.patch({ photos: next, photoAlert: '', photoReplaceIndex: null });
    (event.target as HTMLInputElement).value = '';
  }

  onAreaUnitChange(event: Event): void {
    this.patch({ areaUnit: (event.target as HTMLSelectElement).value });
  }

  dash(value: string): string {
    return value.trim() === '' ? '—' : value;
  }

  onDepartmentChange(event: Event): void {
    this.patch({
      department: (event.target as HTMLSelectElement).value,
      municipality: '',
    });
  }

  onMunicipalityChange(event: Event): void {
    this.patch({ municipality: (event.target as HTMLSelectElement).value });
  }

  onDocumentTypeChange(event: Event): void {
    this.patch({ documentType: (event.target as HTMLSelectElement).value });
  }

  onVarietyChange(name: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form().varieties;
    this.patch({
      varieties: checked ? [...current, name] : current.filter((variety) => variety !== name),
    });
  }

  goNext(): void {
    this.patch({ step: this.form().step + 1 });
  }

  submit(): void {
    this.patch({ summaryOpen: true });
  }

  closeSummary(): void {
    this.patch({ summaryOpen: false, persistError: '' });
  }

  async finish(): Promise<void> {
    if (this.form().submitting) {
      return;
    }
    this.patch({ submitting: true, persistError: '' });
    const current = this.form();
    const pdf = current.pdf;
    try {
      const id = await this.farmRegistration.register({
        farmName: current.farmName,
        department: current.department,
        municipality: current.municipality,
        village: current.village,
        area: current.area,
        areaUnit: current.areaUnit,
        altitude: current.altitude,
        varieties: current.varieties,
        otherVariety: current.otherVariety,
        ownerName: current.ownerName,
        documentType: current.documentType,
        documentNumber: current.documentNumber,
        email: current.email,
        mobile: current.mobile,
        phoneAreaCode: current.phoneAreaCode,
        landline: current.landline,
        bio: current.bio,
        experience: current.experience,
        photos: await Promise.all(
          current.photos.map(async ({ file }) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            bytes: await file.arrayBuffer(),
          })),
        ),
        pdf: pdf
          ? {
              name: pdf.name,
              type: pdf.type,
              size: pdf.size,
              bytes: await pdf.arrayBuffer(),
            }
          : null,
      });
      this.patch({
        requestNumber: id,
        summaryOpen: false,
        successOpen: true,
        submitting: false,
      });
    } catch {
      this.patch({
        submitting: false,
        persistError: 'No se pudo guardar la solicitud. Intenta de nuevo.',
      });
    }
  }

  acknowledge(): void {
    this.resetForm();
    this.closed.emit();
  }

  goBack(): void {
    this.patch({ step: Math.max(1, this.form().step - 1) });
  }

  cancel(): void {
    if (!confirm('¿Deseas cancelar el registro? Se perderá la información diligenciada.')) {
      return;
    }
    this.resetForm();
    this.closed.emit();
  }

  private resetForm(): void {
    for (const photo of this.form().photos) {
      URL.revokeObjectURL(photo.url);
    }
    this.form.set(emptyWizardForm);
  }
}
