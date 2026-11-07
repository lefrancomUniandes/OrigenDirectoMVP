import { lotVarieties } from '../../../core/catalogs/lot-varieties';
import { LotStatus, LotUnit } from '../data/lot';

export interface LotDraft {
  quantity: string;
  unit: string;
  variety: string;
  other: string;
  altitude: string;
  price: string;
  status: LotStatus;
  notes: string;
}

export interface LotWrite {
  quantity: number;
  unit: LotUnit;
  variety: string;
  altitude: number;
  price: number;
  status: LotStatus;
  notes: string;
}

export const emptyLotDraft: LotDraft = {
  quantity: '',
  unit: '',
  variety: '',
  other: '',
  altitude: '',
  price: '',
  status: 'Disponible',
  notes: '',
};

export function fieldError(field: keyof LotDraft, draft: LotDraft): string {
  switch (field) {
    case 'quantity':
      return quantityError(draft.quantity);
    case 'unit':
      return unitError(draft.unit);
    case 'variety':
      return varietyError(draft.variety);
    case 'other':
      return otherVarietyError(draft.variety, draft.other);
    case 'altitude':
      return altitudeError(draft.altitude);
    case 'price':
      return priceError(draft.price);
    case 'notes':
      return notesError(draft.notes);
    case 'status':
      return '';
  }
}

export function lotFormValid(draft: LotDraft): boolean {
  return (Object.keys(emptyLotDraft) as (keyof LotDraft)[]).every(
    (field) => fieldError(field, draft) === '',
  );
}

export function lotWriteFromDraft(draft: LotDraft): LotWrite {
  return {
    quantity: Number(draft.quantity),
    unit: draft.unit as LotUnit,
    variety: draft.variety === 'Otra' ? draft.other.trim() : draft.variety,
    altitude: Number(draft.altitude),
    price: Number(draft.price.trim().replace(/\./g, '')),
    status: draft.status,
    notes: draft.notes.trim(),
  };
}

export function unitLabel(unit: string): string {
  return unit === 'kg' ? 'kg' : 'sacos (70kg)';
}

export function priceLabel(price: number, unit: string): string {
  const per = unit === 'kg' ? 'kg' : 'saco';
  return `$${price.toLocaleString('es-CO')} COP / ${per}`;
}

export function altitudeLabel(altitude: number): string {
  return `${altitude.toLocaleString('es-CO')} m.s.n.m.`;
}

export function lotDeleteName(lot: { variety: string; quantity: number; unit: string }): string {
  return `${lot.variety} - ${lot.quantity} ${unitLabel(lot.unit)}`;
}

function quantityError(value: string): string {
  if (!value.trim()) {
    return 'La cantidad es obligatoria.';
  }
  if (!/^[1-9]\d*$/.test(value)) {
    return 'Ingresa un número entero positivo, sin decimales, espacios ni caracteres especiales.';
  }
  return '';
}

function unitError(value: string): string {
  if (value !== 'kg' && value !== 'sacos') {
    return 'Selecciona la unidad de medida.';
  }
  return '';
}

function varietyError(value: string): string {
  if (!(lotVarieties as readonly string[]).includes(value)) {
    return 'Selecciona una variedad.';
  }
  return '';
}

function otherVarietyError(variety: string, other: string): string {
  if (variety !== 'Otra') {
    return '';
  }
  const name = other.trim();
  if (!name) {
    return 'Escribe el nombre de la variedad.';
  }
  if (name.length > 50) {
    return 'Máximo 50 caracteres.';
  }
  return '';
}

function altitudeError(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'La altitud es obligatoria.';
  }
  if (!/^\d+$/.test(trimmed)) {
    return 'Solo números enteros, sin decimales ni letras.';
  }
  const altitude = Number(trimmed);
  if (altitude < 500 || altitude > 2500) {
    return 'La altitud debe estar entre 500 y 2500 m.s.n.m.';
  }
  return '';
}

function priceError(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'El precio es obligatorio.';
  }
  if (/^[0.]+$/.test(trimmed)) {
    return 'El precio debe ser mayor a cero.';
  }
  const grouped = /^(?:[1-9]\d*|[1-9]\d{0,2}(?:\.\d{3})+)$/;
  if (!grouped.test(trimmed)) {
    return 'Ingresa un valor en pesos (COP), sin decimales ni signos.';
  }
  return '';
}

function notesError(value: string): string {
  if (value.length > 300) {
    return 'Máximo 300 caracteres.';
  }
  return '';
}
