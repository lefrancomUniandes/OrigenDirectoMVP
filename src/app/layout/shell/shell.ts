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
  readonly formularioAbierto = signal(false);
  readonly nombreFinca = signal('');

  nombreIngresado(evento: Event): void {
    this.nombreFinca.set((evento.target as HTMLInputElement).value);
  }
}
