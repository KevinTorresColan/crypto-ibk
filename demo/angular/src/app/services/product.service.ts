import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../interfaces/service.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async getProducts(): Promise<{ data: Product[] }> {
    const response$ = this.http.get<{ data: Product[] }>(
      `${this.apiUrl}/productos`,
    );
    return await firstValueFrom(response$);
  }
}
