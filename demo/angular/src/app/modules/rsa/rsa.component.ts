import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Product } from '../../interfaces/service.interface';
import { CryptoClient, Mode, SignMode } from 'ibk-crypto';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { KeysService } from '../../services/keys.service';
import { RsaService } from '../../services/rsa.service';
import { base64ToUint8Array } from '../../utils/general';

@Component({
  selector: 'app-rsa',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './rsa.component.html',
  styleUrl: './rsa.component.css',
})
export class RsaComponent {
  @Output() productAdded = new EventEmitter<Product>();

  private keysService = inject(KeysService);
  private rsaService = inject(RsaService);

  form: Product | null = null;

  handleProductData(data: Product) {
    this.form = data;
  }

  /**
   * Cifra los datos del formulario usando RSA con clave pública del servidor
   * 1. Obtiene la clave pública del servidor en formato DER
   * 2. Cifra los datos del formulario usando CryptoClient.RSA
   * 3. Envía el texto cifrado al servidor y retorna el producto descifrado
   */
  async encryptKeyServer() {
    // Obtiene la clave pública RSA del servidor
    const publicKey = await this.keysService.getServerPublicKeyRSA();

    // Crea un builder de RSA configurado en modo ENCRYPT
    const build = CryptoClient.RSA().builder().withMode(Mode.ENCRYPT);
    // Configura el builder con la clave pública remota del servidor
    await build.withRemotePublicKey(publicKey);
    // Construye la instancia RSA lista para cifrar
    const rsa = await build.build();
    // Cifra los datos del formulario (convertidos a JSON) y obtiene el buffer cifrado
    const ciphertextBuffer = await rsa.encrypt(JSON.stringify(this.form));

    // Convierte el buffer cifrado a una cadena base64
    const ciphertextBase64 = btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
    );
    // Envía el texto cifrado al servidor y recibe la respuesta
    const res = await this.rsaService.encrypted(ciphertextBase64);
    // Actualiza los productos con los datos descifrados recibidos del servidor
    this.productAdded.emit(res.data);
  }

  /**
   * Cifra los datos del formulario usando RSA con clave generada internamente
   * 1. Crea un builder RSA en modo ENCRYPT sin clave remota (genera par de claves local)
   * 2. Cifra los datos del formulario usando la clave pública generada
   * 3. Convierte el resultado a base64 y lo muestra en consola
   * Nota: Esta función no envía datos al servidor, solo demuestra el cifrado local
   */
  async encryptKeyInternal() {
    // Crea un builder de RSA en modo ENCRYPT sin clave remota
    const build = CryptoClient.RSA().builder().withMode(Mode.ENCRYPT);
    // Construye la instancia RSA generando un par de claves local automáticamente
    const rsa = await build.build();
    // Cifra los datos del formulario usando la clave pública generada internamente
    const ciphertextBuffer = await rsa.encrypt(JSON.stringify(this.form));

    // Convierte el buffer cifrado a una cadena en formato base64
    const ciphertextBase64 = btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
    );
    // Muestra el texto cifrado en consola para demostración
    console.log('Ciphertext Base64:', ciphertextBase64);
  }

  /**
   * Cifra y firma los datos del formulario usando RSA
   * 1. Obtiene la clave pública del servidor en formato PEM
   * 2. Crea un builder RSA con modo ENCRYPT y SignMode.SIGN
   * 3. Cifra los datos del formulario y firma el texto cifrado
   * 4. Envía el ciphertext, signature y clave pública de firma al servidor
   * 5. Retorna el producto descifrado y verificado por el servidor
   */
  async encryptAndSignature() {
    // Obtiene la clave pública RSA del servidor para cifrado
    const publicKey = await this.keysService.getServerPublicKeyRSA();

    // Crea un builder RSA configurado en modo ENCRYPT y con capacidad de firma (SIGN)
    const build = CryptoClient.RSA()
      .builder()
      .withMode(Mode.ENCRYPT)
      .withSignMode(SignMode.SIGN);

    // Configura la clave pública remota del servidor para cifrado
    await build.withRemotePublicKey(publicKey);
    // Obtiene la clave pública de firma del cliente generada internamente
    const clientPublicKey = await build.getSignaturePublicKey();

    // Construye la instancia RSA con capacidad de cifrado y firma
    const rsa = await build.build();

    // Cifra los datos del formulario y obtiene el buffer cifrado
    const ciphertextBuffer = await rsa.encrypt(JSON.stringify(this.form));

    // Firma el texto cifrado con la clave privada de firma del cliente
    const signatureBuffer = await rsa.sign(ciphertextBuffer);

    // Convierte el texto cifrado a formato base64
    const ciphertext = btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
    );
    // Convierte la firma a formato base64
    const signature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer)),
    );

    // Envía el texto cifrado, la firma y la clave pública de firma al servidor
    const res = await this.rsaService.encryptedFirma({
      ciphertext,
      signature,
      clientPublicKey,
    });
    // Actualiza los productos con los datos descifrados y verificados del servidor
    this.productAdded.emit(res.data);
  }

  /**
   * Descifra los datos de tarjeta usando RSA con clave privada local
   * 1. Crea un builder RSA en modo DECRYPT y obtiene la clave pública
   * 2. Envía la clave pública al servidor para obtener datos cifrados de tarjeta
   * 3. Descifra los datos usando la clave privada local y muestra el resultado
   */
  async decrypted() {
    // Crea un builder RSA configurado en modo DECRYPT
    const build = CryptoClient.RSA().builder().withMode(Mode.DECRYPT);
    // Obtiene la clave pública del par de claves generado localmente
    const publicKey = await build.getPublicKey();
    // Construye la instancia RSA con capacidad de descifrado
    const rsa = await build.build();
    // Solicita al servidor datos de tarjeta cifrados enviando nuestra clave pública
    const tarjetData = await this.rsaService.getTarjet(publicKey);
    // Convierte el texto cifrado de base64 a bytes (Uint8Array)
    const ciphertextBytes = base64ToUint8Array(tarjetData.ciphertext);

    // Descifra los datos usando nuestra clave privada local
    const descriptedBuffer = await rsa.decrypt(ciphertextBytes);

    // Decodifica el buffer descifrado a texto legible
    const decryptedText = new TextDecoder().decode(descriptedBuffer);
    // Muestra en consola los datos de la tarjeta descifrados
    console.log('✅ Tarjeta descifrada correctamente', decryptedText);
  }

  /**
   * Descifra y verifica la firma de los datos de tarjeta usando RSA
   * 1. Crea un builder RSA en modo DECRYPT con SignMode.VERIFY
   * 2. Obtiene la clave pública local y la envía al servidor
   * 3. Recibe del servidor los datos cifrados, la firma y la clave pública de firma
   * 4. Configura la clave pública remota para verificar la firma
   * 5. Descifra los datos usando la clave privada local
   * 6. Verifica automáticamente la firma y muestra el resultado descifrado
   */
  async decryptedAndVerify() {
    // Crea un builder RSA en modo DECRYPT con capacidad de verificar firmas (VERIFY)
    const build = CryptoClient.RSA()
      .builder()
      .withMode(Mode.DECRYPT)
      .withSignMode(SignMode.VERIFY);

    // Obtiene la clave pública del par de claves de descifrado generado localmente
    const publicKey = await build.getPublicKey();

    // Solicita al servidor datos de tarjeta cifrados y firmados, enviando nuestra clave pública
    const tarjetData = await this.rsaService.getTarjetAndVerify(publicKey);
    // Configura la clave pública remota del servidor para verificar la firma
    await build.withRemoteSignaturePublicKey(tarjetData.publicKeySign);
    // Construye la instancia RSA con capacidad de descifrado y verificación de firma
    const rsa = await build.build();
    // Convierte el texto cifrado de base64 a bytes (Uint8Array)
    const ciphertextBytes = base64ToUint8Array(tarjetData.ciphertext);

    // Descifra los datos con nuestra clave privada (la verificación de firma es automática)
    const descriptedBuffer = await rsa.decrypt(ciphertextBytes);

    // Decodifica el buffer descifrado a texto legible
    const decryptedText = new TextDecoder().decode(descriptedBuffer);
    // Muestra en consola los datos descifrados confirmando que la firma fue verificada
    console.log(
      '✅ Tarjeta descifrada y Firma verificada correctamente',
      decryptedText,
    );
  }

  /**
   * Firma un número de tarjeta y lo envía al backend para verificación
   * 1. Crea un builder RSA con capacidad de firma (SignMode.SIGN)
   * 2. Obtiene la clave pública de firma que se enviará al servidor
   * 3. Firma el número de tarjeta con la clave privada local
   * 4. Envía el número de tarjeta, la firma y la clave pública al servidor
   * 5. El servidor verifica la firma y confirma la autenticidad
   */
  async signature() {
    // Número de tarjeta a firmar
    const cardNumber = '1234-5678-9012-3456';

    // Crea un builder RSA configurado solo con capacidad de firma
    const build = CryptoClient.RSA().builder().withSignMode(SignMode.SIGN);

    // Obtiene la clave pública de firma para enviarla al servidor
    const publicKey = await build.getSignaturePublicKey();

    // Construye la instancia RSA con capacidad de firma
    const rsa = await build.build();

    // Convierte el número de tarjeta a bytes para firmarlo
    const cardNumberBytes = new TextEncoder().encode(cardNumber);

    // Firma el número de tarjeta con la clave privada local
    const signatureBuffer = await rsa.sign(cardNumberBytes);

    // Convierte la firma a formato base64 para transmisión
    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer)),
    );

    // Envía el número de tarjeta, la firma y la clave pública al servidor para verificación
    const res = await this.rsaService.verify({
      cardNumber,
      signature: signatureBase64,
      publicKey,
    });

    // Muestra el resultado de la verificación
    if (res.success) {
      console.log('✅ Firma verificada correctamente en el servidor', res.data);
    } else {
      console.error('❌ Error al verificar la firma:', res.message);
    }
  }

  /**
   * Verifica una firma enviada por el backend
   * 1. Solicita al servidor que firme un número de tarjeta
   * 2. Recibe la firma y la clave pública del servidor
   * 3. Crea un builder RSA con capacidad de verificación (SignMode.VERIFY)
   * 4. Configura la clave pública remota del servidor
   * 5. Verifica la firma usando la clave pública del servidor
   */
  async verify() {
    // Número de tarjeta que el servidor firmará
    const cardNumber = '1234-5678-9012-3456';

    // Solicita al servidor que firme el número de tarjeta
    const signatureData = await this.rsaService.signature(cardNumber);

    if (!signatureData.success) {
      console.error(
        '❌ Error al obtener firma del servidor:',
        signatureData.message,
      );
      return;
    }

    // Crea un builder RSA configurado solo con capacidad de verificación
    const build = CryptoClient.RSA().builder().withSignMode(SignMode.VERIFY);

    // Configura la clave pública remota del servidor para verificar la firma
    await build.withRemoteSignaturePublicKey(signatureData.data.publicKey);

    // Construye la instancia RSA con capacidad de verificación
    const rsa = await build.build();

    // Convierte el número de tarjeta a bytes para verificar
    const cardNumberBytes = new TextEncoder().encode(cardNumber);

    // Convierte la firma de base64 a bytes
    const signatureBytes = base64ToUint8Array(signatureData.data.signature);

    // Verifica la firma usando la clave pública del servidor
    const isValid = await rsa.verify(cardNumberBytes, signatureBytes);

    // Muestra el resultado de la verificación
    if (isValid) {
      console.log('✅ Firma del servidor verificada correctamente', {
        cardNumber,
        verified: true,
      });
    } else {
      console.error('❌ La firma del servidor NO es válida');
    }
  }
}
