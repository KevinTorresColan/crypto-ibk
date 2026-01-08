import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RsaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async encrypted(ciphertext: string) {
    const response$ = this.http.post<any>(`${this.apiUrl}/decrypted-rsa`, {
      ciphertext,
    });
    return await firstValueFrom(response$);
  }

  async encryptedFirma(payload: {
    ciphertext: string;
    signature: string;
    clientPublicKey: string;
  }) {
    const response$ = this.http.post<any>(
      `${this.apiUrl}/decrypted-rsa-firma`,
      payload,
    );
    return await firstValueFrom(response$);
  }

  async getTarjet(publicKey: string) {
    const response$ = this.http.post<any>(`${this.apiUrl}/encrypted-rsa`, {
      publicKey,
    });
    return await firstValueFrom(response$);
  }

  async getTarjetAndVerify(publicKey: string) {
    const response$ = this.http.post<any>(
      `${this.apiUrl}/encrypted-rsa-verify`,
      { publicKey },
    );
    return await firstValueFrom(response$);
  }

  async verify(payload: {
    cardNumber: string;
    signature: string;
    publicKey: string;
  }) {
    const response$ = this.http.post<any>(`${this.apiUrl}/verify-rsa`, payload);
    return await firstValueFrom(response$);
  }

  async signature(cardNumber: string) {
    const response$ = this.http.post<any>(`${this.apiUrl}/signature-rsa`, {
      cardNumber,
    });
    return await firstValueFrom(response$);
  }
}
