import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class KeysService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async getServerPublicKeyRSA(): Promise<string> {
    const response$ = this.http.get(`${this.apiUrl}/public-key-rsa`, {
      responseType: 'text',
    });
    return await firstValueFrom(response$);
  }

  async getServerPublicKeyEC(): Promise<string> {
    const response$ = this.http.get(`${this.apiUrl}/public-key-ec`, {
      responseType: 'text',
    });
    return await firstValueFrom(response$);
  }

  async getServerPublicKeyECDER(): Promise<string> {
    const response$ = this.http.get(`${this.apiUrl}/public-key-ec-der`, {
      responseType: 'text',
    });
    return await firstValueFrom(response$);
  }

  async getHMacKey(): Promise<string> {
    const response$ = this.http.get(`${this.apiUrl}/hmac-secret-key`, {
      responseType: 'text',
    });
    return await firstValueFrom(response$);
  }
}
