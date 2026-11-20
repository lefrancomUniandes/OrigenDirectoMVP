import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-origin-card',
  templateUrl: './origin-card.html',
  styleUrl: './origin-card.scss',
})
export class OriginCard {
  readonly name = input('');
  readonly photo = input('');
  readonly publishedOn = input('');
  readonly farmName = input('');
  readonly department = input('');
  readonly variety = input('');
  readonly process = input('');
  readonly roast = input('');
  readonly altitude = input<number | undefined>(undefined);
  readonly notes = input<readonly string[]>([]);
  readonly editHref = input('');
  readonly badge = input('✦ Nuevo');
  readonly inactive = input(false);
  readonly showSwitch = input(false);
  readonly active = input(false);
  readonly activeChange = output<boolean>();

  onActive(event: Event): void {
    this.activeChange.emit((event.target as HTMLInputElement).checked);
  }

  dateLabel(): string {
    const iso = this.publishedOn();
    if (!iso) {
      return '';
    }
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const [, month, day] = iso.split('-');
    return `${Number(day)} ${months[Number(month) - 1]}`;
  }
}
