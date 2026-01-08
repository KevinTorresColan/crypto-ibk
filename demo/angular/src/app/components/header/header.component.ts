import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header__container">
      <button (click)="algorithmChange.emit('EC')">EC</button>
      <button (click)="algorithmChange.emit('OTEC')">OTEC</button>
      <button (click)="algorithmChange.emit('RSA')">RSA</button>
    </header>
  `,
  styles: [
    `
      .header__container {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background-color: #f5f5f5;
      }

      button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        border: 1px solid #ccc;
        background-color: white;
        border-radius: 4px;
      }

      button:hover {
        background-color: #e0e0e0;
      }
    `,
  ],
})
export class HeaderComponent {
  @Output() algorithmChange = new EventEmitter<string>();
}
