import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Product } from '../../interfaces/service.interface';
import { CipherSuite, CryptoClient, ECCurve, Mode } from 'ibk-crypto';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { EcService } from '../../services/ec.service';
import { KeysService } from '../../services/keys.service';
import { base64ToUint8Array } from '../../utils/general';

@Component({
  selector: 'app-otec',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './otec.component.html',
  styleUrl: './otec.component.css',
})
export class OtecComponent {
  @Output() productAdded = new EventEmitter<Product>();

  private ecService = inject(EcService);
  private keysService = inject(KeysService);

  form: Product | null = null;

  handleProductData(data: Product) {
    this.form = data;
  }

  /**
   * Cifra los datos del formulario usando OTEC (One-Time Elliptic Curve)
   * 1. Obtiene la clave pública del servidor
   * 2. Configura el builder OTEC con curva P-256, suite AES-256-GCM-SHA256 y modo cifrado
   * 3. Establece la clave pública remota del servidor
   * 4. Obtiene la clave pública local (efímera de un solo uso) para compartir
   * 5. Cifra los datos usando cipher.doFinal() y los convierte a base64
   * 6. Envía el payload con la clave efímera y el texto cifrado al servidor
   */
  async encrypt() {
    try {
      const serverKey = await this.keysService.getServerPublicKeyEC();

      const builder = CryptoClient.OTEC()
        .builder()
        .withCurve(ECCurve.P256)
        .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
        .withMode(Mode.ENCRYPT);

      await builder.withRemotePublicKey(serverKey);
      const localPublicKey = await builder.getPublicKey();
      const cipher = await builder.build();

      const ciphertextBuffer = await cipher.doFinal(JSON.stringify(this.form));

      const ciphertextBase64 = btoa(
        String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
      );

      const payload = {
        ephemeralPublicKey: localPublicKey,
        ciphertext: ciphertextBase64,
      };

      console.log('EC Builder - SEND', payload);

      const res = await this.ecService.encrypted(payload);
      this.productAdded.emit(res.data);
    } catch (error) {
      console.error('Error en OTECEncrypt:', error);
    }
  }

  /**
   * Descifra datos encriptados recibidos del servidor usando OTEC
   * 1. Configura el builder OTEC con curva P-256, suite AES-256-GCM-SHA256 y modo descifrado
   * 2. Obtiene la clave pública local para enviar al servidor
   * 3. Solicita al servidor los datos cifrados de la tarjeta
   * 4. Establece la clave pública remota recibida del servidor
   * 5. Descifra el ciphertext usando cipher.doFinal() y muestra el resultado en consola
   */
  async decrypt() {
    try {
      const builder = CryptoClient.OTEC()
        .builder()
        .withCurve(ECCurve.P256)
        .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
        .withMode(Mode.DECRYPT);

      const localPublicKey = await builder.getPublicKey();
      console.log('Clave pública local:', localPublicKey);

      const tarjet = await this.ecService.getTarjet({
        ephemeralPublicKey: localPublicKey,
      });
      console.log('Tarjet recibido:', tarjet);

      await builder.withRemotePublicKey(tarjet.serverPublicKey);

      const cipher = await builder.build();

      const ciphertextBytes = base64ToUint8Array(tarjet.ciphertext);

      const inputForDoFinal: any = ciphertextBytes.buffer || ciphertextBytes;
      const decrypted = await cipher.doFinal(inputForDoFinal);

      const decryptedBuf =
        decrypted instanceof ArrayBuffer ? decrypted : decrypted;
      const plaintext = new TextDecoder().decode(new Uint8Array(decryptedBuf));
      console.log('Decrypted (builder):', plaintext);
    } catch (error) {
      console.error('Error en decrypt con builder:', error);
    }
  }
}
