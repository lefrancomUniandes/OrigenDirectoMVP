import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Origin } from '../data/origin';
import { OriginRegistrationService } from '../services/origin-registration.service';

@Component({
  selector: 'app-origin-registration-page',
  templateUrl: './origin-registration-page.html',
  styleUrl: './origin-registration-page.scss',
})
export class OriginRegistrationPage {
  readonly notes = signal<string[]>([]);
  readonly errors = signal<Record<string, string>>({});
  readonly evidences = signal<{ name: string; url?: string }[]>([]);
  readonly notice = signal('');
  readonly editing = signal(false);
  private editingId = '';
  private applied = false;
  private readonly loaded = signal<Origin | null>(null);
  private readonly formRef = viewChild<ElementRef<HTMLFormElement>>('form');
  private readonly origins = inject(OriginRegistrationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.queryParamMap.get('editar') ?? '';
    if (!id) {
      return;
    }
    this.editing.set(true);
    this.editingId = id;
    void this.origins.find(id).then((origin) => {
      if (origin) {
        this.loaded.set(origin);
      }
    });

    effect(() => {
      const form = this.formRef()?.nativeElement;
      const origin = this.loaded();
      if (this.applied || !form || !origin) {
        return;
      }
      this.applied = true;
      this.fill(form, origin);
    });
  }

  private fill(form: HTMLFormElement, origin: Origin): void {
    (form.querySelector('#nombre') as HTMLInputElement).value = origin.name;
    (form.querySelector('#variedad') as HTMLSelectElement).value = origin.variety ?? '';
    (form.querySelector('#proceso') as HTMLSelectElement).value = origin.process ?? '';
    (form.querySelector('#tueste') as HTMLSelectElement).value = origin.roast ?? '';
    (form.querySelector('#altura') as HTMLInputElement).value = origin.altitude ? String(origin.altitude) : '';
    this.notes.set([...(origin.notes ?? [])]);
    if (origin.photo) {
      this.evidences.set([{ name: origin.name, url: origin.photo }]);
    }
  }

  addNote(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.notes().includes(value)) {
      this.notes.update((current) => [...current, value]);
    }
    input.value = '';
  }

  async addEvidence(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    for (const file of files) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'application/pdf') {
        this.notice.set(`${file.name}: formato no permitido`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.notice.set(`${file.name}: supera 5 MB`);
        continue;
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        const url = await readDataUrl(file);
        this.evidences.update((current) => [...current, { name: file.name, url }]);
      } else {
        this.evidences.update((current) => [...current, { name: file.name }]);
      }
    }
    input.value = '';
  }

  async publish(event: Event): Promise<void> {
    const form = (event.target as HTMLElement).closest('form');
    if (!form) {
      return;
    }
    const data = new FormData(form);
    const name = String(data.get('nombre') ?? '');
    const variety = String(data.get('variedad') ?? '');
    const process = String(data.get('proceso') ?? '');
    const roast = String(data.get('tueste') ?? '');
    const altitude = String(data.get('altura') ?? '').trim();
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors['nombre'] = 'Ingrese el nombre del lote';
    }
    if (!variety) {
      errors['variedad'] = 'Debe indicar la variedad del grano';
    }
    if (!process) {
      errors['proceso'] = 'Seleccione el método de fermentación';
    }
    if (!roast) {
      errors['tueste'] = 'Seleccione el perfil de tueste';
    }
    if (this.notes().length === 0) {
      errors['nota'] = 'Agregue al menos una nota de cata';
    }
    if (!altitude) {
      errors['altura'] = 'Indique la altura del cultivo';
    } else if (!/^\d+$/.test(altitude)) {
      errors['altura'] = 'Solo se permiten números';
    } else if (Number(altitude) < 100 || Number(altitude) > 4000) {
      errors['altura'] = 'Ingrese una altura entre 100 y 4000 m.s.n.m.';
    }

    this.errors.set(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    await this.origins.publish({
      name,
      variety,
      process,
      roast,
      altitude: Number(altitude),
      notes: this.notes(),
      photo: this.evidences().find((file) => file.url)?.url ?? '',
    });
    await this.router.navigateByUrl('/origenes');
  }

  async saveDraft(event: Event): Promise<void> {
    const form = (event.target as HTMLElement).closest('form');
    if (!form) {
      return;
    }
    const name = String(new FormData(form).get('nombre') ?? '');
    await this.origins.saveDraft(name);
    await this.router.navigateByUrl('/origenes');
  }

  async saveChanges(event: Event): Promise<void> {
    const form = (event.target as HTMLElement).closest('form');
    if (!form) {
      return;
    }
    const name = String(new FormData(form).get('nombre') ?? '');
    await this.origins.saveChanges(this.editingId, name);
    await this.router.navigateByUrl('/origenes');
  }
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
