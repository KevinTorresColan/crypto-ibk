import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/service.interface';

@Component({
  selector: 'app-get-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngFor="let product of products; let i = index">
      <h3>{{ product.nombre }}</h3>
      <p>Stock: {{ product.stock }}</p>
    </div>
  `,
})
export class GetProductsComponent {
  @Input() products: Product[] = [];
}
