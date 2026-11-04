import { Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';

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

  onFarmNameInput(event: Event): void {
    this.farmName.set((event.target as HTMLInputElement).value);
  }

  onDepartmentChange(event: Event): void {
    this.department.set((event.target as HTMLSelectElement).value);
  }

  cancel(): void {
    if (!confirm('¿Deseas cancelar el registro? Se perderá la información diligenciada.')) {
      return;
    }
    this.farmName.set('');
    this.formOpen.set(false);
  }
}
