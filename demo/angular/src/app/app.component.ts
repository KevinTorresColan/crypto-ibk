import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GetProductsComponent } from './components/get-products/get-products.component';
import { HeaderComponent } from './components/header/header.component';
import { EcComponent } from './modules/ec/ec.component';
import { OtecComponent } from './modules/otec/otec.component';
import { RsaComponent } from './modules/rsa/rsa.component';
import { ProductService } from './services/product.service';
import { Product } from './interfaces/service.interface';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    GetProductsComponent,
    EcComponent,
    OtecComponent,
    RsaComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private productService = inject(ProductService);

  selectedAlgorithm: string = 'EC';
  products: Product[] = [];

  async ngOnInit() {
    const result = await this.productService.getProducts();
    this.products = result.data;
  }

  handleAlgorithmChange(algorithm: string) {
    this.selectedAlgorithm = algorithm;
  }

  handleProducts(product: Product) {
    this.products = [...this.products, product];
  }
}
