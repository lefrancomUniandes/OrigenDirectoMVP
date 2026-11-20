import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  private readonly origins = inject(OriginRegistrationService);
  private readonly router = inject(Router);

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

  publish(event: Event): void {
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
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
