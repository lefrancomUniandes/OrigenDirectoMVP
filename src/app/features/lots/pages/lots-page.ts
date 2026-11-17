import { Component, computed, inject, signal } from '@angular/core';
import { toString as qrSvg } from 'qrcode';
import { lotVarieties } from '../../../core/catalogs/lot-varieties';
import { qrPng } from '../services/qr-png';
import { Lot } from '../data/lot';
import {
  LotDraft,
  altitudeLabel,
  emptyLotDraft,
  fieldError,
  lotDeleteName,
  lotFormValid,
  lotWriteFromDraft,
  priceLabel,
  unitLabel,
} from '../services/lot-form';
import { LotsService } from '../services/lots.service';

@Component({
  selector: 'app-lots-page',
  providers: [LotsService],
  templateUrl: './lots-page.html',
  styleUrl: './lots-page.scss',
})
export class LotsPage {
  readonly service = inject(LotsService);
  readonly lotVarieties = lotVarieties;
  readonly unitLabel = unitLabel;
  readonly priceLabel = priceLabel;
  readonly altitudeLabel = altitudeLabel;
  readonly lotDeleteName = lotDeleteName;

  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<LotDraft>(emptyLotDraft);
  readonly touched = signal<ReadonlySet<keyof LotDraft>>(new Set());
  readonly confirmId = signal<string | null>(null);
  readonly toasts = signal<readonly string[]>([]);
  readonly qrLotId = signal<string | null>(null);
  readonly qrImage = signal('');
  readonly qrBytes = signal<Uint8Array | null>(null);

  readonly canSave = computed(() => lotFormValid(this.draft()));
  readonly confirmLot = computed(
    () => this.service.lots().find((lot) => lot.id === this.confirmId()) ?? null,
  );

  message(field: keyof LotDraft): string {
    if (!this.touched().has(field)) {
      return '';
    }
    return fieldError(field, this.draft());
  }

  openCreate(): void {
    this.editingId.set(null);
    this.draft.set(emptyLotDraft);
    this.touched.set(new Set());
    this.formOpen.set(true);
  }

  openEdit(lot: Lot): void {
    const known = (lotVarieties as readonly string[]).includes(lot.variety);
    this.editingId.set(lot.id);
    this.draft.set({
      quantity: String(lot.quantity),
      unit: lot.unit,
      variety: known ? lot.variety : 'Otra',
      other: known ? '' : lot.variety,
      altitude: String(lot.altitude),
      price: lot.price.toLocaleString('es-CO'),
      status: lot.status,
      notes: lot.notes,
    });
    this.touched.set(new Set());
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }

  onField(field: keyof LotDraft, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draft.update((current) => ({ ...current, [field]: value }));
    this.touch(field);
  }

  touch(field: keyof LotDraft): void {
    this.touched.update((current) => new Set(current).add(field));
  }

  qrLink(id: string): string {
    return `${location.origin}/origen/lote/${id}`;
  }

  async openQr(lot: Lot): Promise<void> {
    const link = this.qrLink(lot.id);
    const svg = await qrSvg(link, { type: 'svg', margin: 1 });
    const png = await qrPng(link);
    this.qrImage.set(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    this.qrBytes.set(png);
    this.qrLotId.set(lot.id);
  }

  downloadQr(): void {
    const image = this.qrImage();
    if (!image) {
      return;
    }
    const file = document.createElement('a');
    file.href = image;
    file.download = 'codigo-qr.svg';
    file.click();
  }

  async copyLink(): Promise<void> {
    const id = this.qrLotId();
    if (!id) {
      return;
    }
    await navigator.clipboard.writeText(this.qrLink(id));
    this.toast('Enlace copiado');
  }

  async share(): Promise<void> {
    const id = this.qrLotId();
    const png = this.qrBytes();
    if (!id || !png) {
      return;
    }
    const bytes = new ArrayBuffer(png.byteLength);
    new Uint8Array(bytes).set(png);
    const file = new File([bytes], 'codigo-qr.png', { type: 'image/png' });
    await navigator.share({ text: this.qrLink(id), files: [file] });
  }

  askRemove(lot: Lot): void {
    this.confirmId.set(lot.id);
  }

  cancelRemove(): void {
    this.confirmId.set(null);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSave()) {
      return;
    }
    const write = lotWriteFromDraft(this.draft());
    const editingId = this.editingId();
    if (editingId) {
      await this.service.save(editingId, write);
      this.toast(
        '¡Lote Actualizado con éxito! Ya se encuentra visible en el catálogo público de OrigenDirecto.',
      );
    } else {
      await this.service.publish(write);
      this.toast(
        '¡Lote Publicado con éxito! Ya se encuentra visible en el catálogo público de OrigenDirecto.',
      );
    }
    this.closeForm();
  }

  async confirmRemove(): Promise<void> {
    const id = this.confirmId();
    if (!id) {
      return;
    }
    await this.service.deactivate(id);
    this.confirmId.set(null);
    this.toast('El lote ha sido eliminado correctamente.');
  }

  private toast(message: string): void {
    this.toasts.update((current) => [...current, message]);
  }
}
