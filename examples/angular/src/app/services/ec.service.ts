import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EcService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async encrypted(payload: any) {
    const response$ = this.http.post<any>(
      `${this.apiUrl}/encrypted-ec`,
      payload,
    );
    return await firstValueFrom(response$);
  }

  async getTarjet(key: any) {
    const response$ = this.http.post<any>(`${this.apiUrl}/tarjet-ec`, key);
    return await firstValueFrom(response$);
  }

  async messageSignature() {
    const response$ = this.http.post<any>(`${this.apiUrl}/signature-ec`, {});
    return await firstValueFrom(response$);
  }

  async messageHMACSignature() {
    const response$ = this.http.post<any>(
      `${this.apiUrl}/signature-ec-hmac`,
      {},
    );
    return await firstValueFrom(response$);
  }
}
