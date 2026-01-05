import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interfaces/service.interface';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <article>
      <div>
        <label for="name"></label>
        <input
          (input)="handleInput()"
          type="text"
          id="name"
          placeholder="Nombre del producto"
          name="nombre"
          [(ngModel)]="formData.nombre"
        />
      </div>
      <br />
      <div>
        <label for="stock"></label>
        <input
          (input)="handleInput()"
          type="tel"
          id="stock"
          placeholder="Stock del producto"
          name="stock"
          [(ngModel)]="formData.stock"
        />
      </div>
    </article>
  `,
})
export class ProductFormComponent {
  @Output() dataChange = new EventEmitter<Product>();

  formData: Product = {
    nombre: '',
    stock: 0,
  };

  handleInput() {
    this.dataChange.emit(this.formData);
  }
}
