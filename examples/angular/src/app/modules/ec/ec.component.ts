import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Product } from '../../interfaces/service.interface';
import {
  CipherSuite,
  CryptoClient,
  ECCurve,
  HMACMode,
  Mode,
  SignMode,
} from 'ibk-crypto';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { EcService } from '../../services/ec.service';
import { KeysService } from '../../services/keys.service';
import { base64Encode, base64ToUint8Array } from '../../utils/general';

@Component({
  selector: 'app-ec',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './ec.component.html',
  styleUrl: './ec.component.css',
})
export class EcComponent {
  @Output() productAdded = new EventEmitter<Product>();

  private ecService = inject(EcService);
  private keysService = inject(KeysService);

  form: Product | null = null;

  handleProductData(data: Product) {
    this.form = data;
  }

  /**
   * Cifra los datos del formulario usando criptografía de curva elíptica (EC)
   * 1. Obtiene la clave pública del servidor
   * 2. Configura el builder con curva P-256, suite AES-256-GCM-SHA256 y modo cifrado
   * 3. Establece la clave pública remota del servidor
   * 4. Obtiene la clave pública local (efímera) para compartir con el servidor
   * 5. Cifra los datos del formulario y los convierte a base64
   * 6. Envía el payload con la clave efímera y el texto cifrado al servidor
   */
  async encrypt() {
    const serverKey = await this.keysService.getServerPublicKeyEC();

    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256)
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
      .withMode(Mode.ENCRYPT);

    await builder.withRemotePublicKey(serverKey);
    const localPublicKey = await builder.getPublicKey();
    const cipher = await builder.build();

    const ciphertextBuffer = await cipher.encrypt(JSON.stringify(this.form));
    const ciphertextBase64 = btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
    );

    const payload = {
      ephemeralPublicKey: localPublicKey,
      ciphertext: ciphertextBase64,
    };

    console.log('ENCRYPT - PAYLOAD', payload);

    const res = await this.ecService.encrypted(payload);
    this.productAdded.emit(res.data);
  }

  /**
   * Descifra datos encriptados recibidos del servidor usando EC
   * 1. Configura el builder con curva P-256, suite AES-256-GCM-SHA256 y modo descifrado
   * 2. Obtiene la clave pública local para enviar al servidor
   * 3. Solicita al servidor los datos cifrados de la tarjeta
   * 4. Establece la clave pública remota recibida del servidor
   * 5. Descifra el ciphertext y muestra el resultado en consola
   */
  async decrypt() {
    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256)
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
      .withMode(Mode.DECRYPT);

    const localPublicKey = await builder.getPublicKey();
    const tarjet = await this.ecService.getTarjet({
      ephemeralPublicKey: localPublicKey,
    });
    await builder.withRemotePublicKey(tarjet.serverPublicKey);
    const cipher = await builder.build();
    const ciphertextBytes = base64ToUint8Array(tarjet.ciphertext);

    const inputForDoFinal: any = ciphertextBytes.buffer || ciphertextBytes;
    const decrypted: ArrayBuffer = await cipher.decrypt(inputForDoFinal);
    const decryptedBuf =
      decrypted instanceof ArrayBuffer
        ? decrypted
        : (decrypted as any).buffer || decrypted;
    const plaintext = new TextDecoder().decode(new Uint8Array(decryptedBuf));
    console.log('Decrypted (builder):', plaintext);
  }

  /**
   * Cifra los datos y genera una firma digital usando EC
   * 1. Obtiene la clave pública del servidor
   * 2. Configura el builder con curva P-256, suite AES-256-GCM-SHA256, modo cifrado y firma
   * 3. Establece la clave pública remota del servidor
   * 4. Cifra los datos del formulario
   * 5. Genera una firma digital del texto cifrado usando cipher.sign()
   * 6. Envía el payload con la clave efímera, texto cifrado, clave pública de firma y la firma
   */
  async encryptAndSignature() {
    const serverKey = await this.keysService.getServerPublicKeyEC();

    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256)
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
      .withMode(Mode.ENCRYPT)
      .withSignMode(SignMode.SIGN);

    await builder.withRemotePublicKey(serverKey);
    const localPublicKey = await builder.getPublicKey();
    const cipher = await builder.build();

    const ciphertextBuffer = await cipher.encrypt(JSON.stringify(this.form));
    const ciphertextBase64 = btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
    );

    const signaturePublicKey = await builder.getSignaturePublicKey();
    const signature = await cipher.sign(ciphertextBuffer);
    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signature)),
    );

    const payload = {
      ephemeralPublicKey: localPublicKey,
      ciphertext: ciphertextBase64,
      publicKeySign: signaturePublicKey,
      signature: signatureBase64,
    };

    console.log('EC Builder SIGNATURE - SEND', payload);

    const res = await this.ecService.encrypted(payload);
    this.productAdded.emit(res.data);
  }

  /**
   * Descifra datos y verifica la firma digital recibida del servidor
   * 1. Configura el builder con curva P-256, suite AES-256-GCM-SHA256, modo descifrado y verificación
   * 2. Obtiene la clave pública local para enviar al servidor
   * 3. Solicita al servidor los datos cifrados con firma
   * 4. Establece las claves públicas remotas (clave de cifrado y clave de firma)
   * 5. Verifica la firma digital usando cipher.verify()
   * 6. Descifra el ciphertext y muestra el resultado en consola
   */
  async decryptVerify() {
    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256)
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
      .withMode(Mode.DECRYPT)
      .withSignMode(SignMode.VERIFY);

    const localPublicKey = await builder.getPublicKey();
    const tarjet = await this.ecService.getTarjet({
      ephemeralPublicKey: localPublicKey,
      hasSignature: true,
    });
    await builder.withRemoteSignaturePublicKey(tarjet.publicKeySign);
    await builder.withRemotePublicKey(tarjet.serverPublicKey);

    const cipher = await builder.build();
    const ciphertextBytes = base64ToUint8Array(tarjet.ciphertext);
    const signatureBytes = base64ToUint8Array(tarjet.signature);
    await cipher.verify(ciphertextBytes.buffer, signatureBytes.buffer);

    const inputForDoFinal: any = ciphertextBytes.buffer || ciphertextBytes;
    const decrypted = await cipher.decrypt(inputForDoFinal);
    const decryptedBuf =
      decrypted instanceof ArrayBuffer ? decrypted : decrypted;
    const plaintext = new TextDecoder().decode(new Uint8Array(decryptedBuf));
    console.log('Decrypted (builder):', plaintext);
  }

  /**
   * Genera una firma digital de los datos del formulario sin cifrar
   * 1. Configura el builder solo con modo firma (sin cifrado)
   * 2. Obtiene la clave pública de firma para compartir
   * 3. Convierte los datos del formulario a ArrayBuffer
   * 4. Genera la firma digital usando cipher.sign()
   * 5. Convierte la firma a base64 y la muestra en consola
   */
  async signature() {
    const builder = CryptoClient.EC().builder().withSignMode(SignMode.SIGN);
    const cipher = await builder.build();

    const signaturePublicKey = await builder.getSignaturePublicKey();
    const dataBuffer = new TextEncoder().encode(JSON.stringify(this.form));
    const signature = await cipher.sign(dataBuffer.buffer);

    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signature)),
    );
    console.log('Signature Base64:', {
      signature: signatureBase64,
      publicKey: signaturePublicKey,
    });
  }

  /**
   * Verifica una firma digital recibida del servidor
   * 1. Obtiene del servidor el mensaje, la firma y la clave pública de firma
   * 2. Configura el builder con modo verificación
   * 3. Establece la clave pública remota de firma
   * 4. Convierte el mensaje y la firma de base64 a ArrayBuffer
   * 5. Verifica la firma usando cipher.verify()
   * 6. Muestra confirmación si la verificación es exitosa
   */
  async verify() {
    const data = await this.ecService.messageSignature();
    const builder = CryptoClient.EC().builder().withSignMode(SignMode.VERIFY);
    await builder.withRemoteSignaturePublicKey(data.publicKey);

    const cipher = await builder.build();

    const messageBuffer = new TextEncoder().encode(data.message).buffer;
    const signatureBuffer = base64ToUint8Array(data.signature).buffer;

    await cipher.verify(messageBuffer, signatureBuffer);

    console.log('✅ Firma verificada correctamente');
  }

  /**
   * Genera una firma HMAC usando una clave secreta compartida del servidor
   * 1. Obtiene la clave HMAC secreta del servidor
   * 2. Configura el builder con la clave HMAC remota
   * 3. Convierte los datos del formulario a ArrayBuffer
   * 4. Genera la firma HMAC usando cipher.hmacSign()
   * 5. Codifica la firma en base64 (doble codificación) y la muestra en consola
   */
  async HMACKeyServerSignature() {
    const secret = await this.keysService.getHMacKey();
    const builder = CryptoClient.EC().builder();

    await builder.withRemoteHmacKey(secret);
    const cipher = await builder.build();

    const simulatePayloadBuffer = new TextEncoder().encode(
      JSON.stringify(this.form),
    );

    const signature = await cipher.hmacSign(simulatePayloadBuffer.buffer);

    const signatureArray = new Uint8Array(signature);
    const base64Signature = base64Encode(signatureArray);
    const doubleEncoded = btoa(base64Signature);

    console.log('HMAC Signature:', doubleEncoded);
  }

  /**
   * Genera una firma HMAC usando una clave interna generada automáticamente
   * 1. Configura el builder habilitando HMAC interno (genera su propia clave)
   * 2. Convierte los datos del formulario a ArrayBuffer
   * 3. Genera la firma HMAC usando cipher.hmacSign()
   * 4. Codifica la firma en base64 (doble codificación) y la muestra en consola
   */
  async HMACKeyInternalSignature() {
    const builder = CryptoClient.EC().builder().withHMac(HMACMode.ENABLE);

    const cipher = await builder.build();

    const simulatePayloadBuffer = new TextEncoder().encode(
      JSON.stringify(this.form),
    );

    const signature = await cipher.hmacSign(simulatePayloadBuffer.buffer);

    const signatureArray = new Uint8Array(signature);
    const base64Signature = base64Encode(signatureArray);
    const doubleEncoded = btoa(base64Signature);

    console.log('HMAC Signature:', doubleEncoded);
  }

  /**
   * Verifica una firma HMAC recibida del servidor usando una clave compartida
   * 1. Obtiene del servidor el mensaje, la firma HMAC y la clave secreta
   * 2. Configura el builder con la clave HMAC remota
   * 3. Convierte el mensaje y la firma de base64 a ArrayBuffer
   * 4. Verifica la firma HMAC usando cipher.hmacVerify()
   * 5. Muestra confirmación si la verificación es exitosa
   */
  async HMACKeyServerVerify() {
    const data = await this.ecService.messageHMACSignature();
    const builder = CryptoClient.EC().builder();
    await builder.withRemoteHmacKey(data.key);

    const cipher = await builder.build();

    const messageBuffer = new TextEncoder().encode(data.message).buffer;
    const signatureBuffer = base64ToUint8Array(data.signature).buffer;

    await cipher.hmacVerify(messageBuffer, signatureBuffer);

    console.log('✅ Firma verificada correctamente');
  }

  /**
   * Genera y verifica una firma HMAC usando una clave interna (caso de prueba local)
   * 1. Configura el builder habilitando HMAC interno
   * 2. Convierte el mensaje de prueba a ArrayBuffer
   * 3. Genera la firma HMAC del mensaje usando cipher.hmacSign()
   * 4. Verifica inmediatamente la firma usando cipher.hmacVerify()
   * 5. Muestra confirmación si la verificación es exitosa
   */
  async HMACKeyInternalVerify() {
    const message = 'Mensaje a firmar HMAC local';
    const builder = CryptoClient.EC().builder().withHMac(HMACMode.ENABLE);

    const cipher = await builder.build();

    const messageBuffer = new TextEncoder().encode(message).buffer;
    const signature = await cipher.hmacSign(messageBuffer);

    await cipher.hmacVerify(messageBuffer, signature);

    console.log('✅ Firma verificada correctamente');
  }
}
