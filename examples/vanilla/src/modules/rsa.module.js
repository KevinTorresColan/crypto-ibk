import { CryptoClient, Mode, SignMode } from 'ibk-crypto';
import { keysService } from '../services/keys.service.js';
import { rsaService } from '../services/rsa.service.js';
import { base64ToUint8Array } from '../utils/general.js';

export class RSAModule {
  constructor(onProductAdded) {
    this.onProductAdded = onProductAdded;
    this.form = { nombre: '', stock: 0 };
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Form inputs
    document.getElementById('rsa-nombre').addEventListener('input', (e) => {
      this.form.nombre = e.target.value;
    });
    document.getElementById('rsa-stock').addEventListener('input', (e) => {
      this.form.stock = parseInt(e.target.value) || 0;
    });

    // Buttons
    document
      .getElementById('rsa-encrypt-server')
      .addEventListener('click', () => this.encryptKeyServer());
    document
      .getElementById('rsa-encrypt-internal')
      .addEventListener('click', () => this.encryptKeyInternal());
    document
      .getElementById('rsa-encrypt-signature')
      .addEventListener('click', () => this.encryptAndSignature());
    document
      .getElementById('rsa-decrypt')
      .addEventListener('click', () => this.decrypted());
    document
      .getElementById('rsa-decrypt-verify')
      .addEventListener('click', () => this.decryptedAndVerify());
    document
      .getElementById('rsa-signature')
      .addEventListener('click', () => this.signature());
    document
      .getElementById('rsa-verify')
      .addEventListener('click', () => this.verify());
  }

  /**
   * Cifra los datos del formulario usando RSA con clave del servidor
   * 1. Obtiene la clave pública del servidor
   * 2. Cifra los datos del formulario usando CryptoClient.RSA con patrón builder
   * 3. Envía el texto cifrado al servidor y retorna el producto descifrado
   */
  async encryptKeyServer() {
    try {
      const publicKey = await keysService.getServerPublicKeyRSA();

      const build = CryptoClient.RSA().builder().withMode(Mode.ENCRYPT);
      await build.withRemotePublicKey(publicKey);
      const rsa = await build.build();
      const ciphertextBuffer = await rsa.encrypt(JSON.stringify(this.form));

      const ciphertextBase64 = btoa(
        String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
      );
      const res = await rsaService.encrypted(ciphertextBase64);
      this.onProductAdded(res.data);
    } catch (error) {
      console.error('Error en encryptKeyServer:', error);
    }
  }

  /**
   * Cifra los datos del formulario usando RSA con clave generada internamente
   * 1. Crea un builder RSA en modo ENCRYPT sin clave remota (genera par de claves local)
   * 2. Cifra los datos del formulario usando la clave pública generada
   * 3. Convierte el resultado a base64 y lo muestra en consola
   * Nota: Esta función no envía datos al servidor, solo demuestra el cifrado local
   */
  async encryptKeyInternal() {
    try {
      const build = CryptoClient.RSA().builder().withMode(Mode.ENCRYPT);
      const rsa = await build.build();
      const ciphertextBuffer = await rsa.encrypt(JSON.stringify(this.form));

      const ciphertextBase64 = btoa(
        String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
      );
      console.log('Ciphertext Base64:', ciphertextBase64);
    } catch (error) {
      console.error('Error en encryptKeyInternal:', error);
    }
  }

  /**
   * Cifra y firma los datos del formulario usando RSA
   * 1. Obtiene la clave pública del servidor
   * 2. Crea un builder RSA con modo ENCRYPT y SignMode.SIGN
   * 3. Cifra los datos del formulario y firma el texto cifrado
   * 4. Envía el ciphertext, signature y clave pública de firma al servidor
   * 5. Retorna el producto descifrado y verificado por el servidor
   */
  async encryptAndSignature() {
    try {
      const publicKey = await keysService.getServerPublicKeyRSA();

      const build = CryptoClient.RSA()
        .builder()
        .withMode(Mode.ENCRYPT)
        .withSignMode(SignMode.SIGN);

      await build.withRemotePublicKey(publicKey);
      const clientPublicKey = await build.getSignaturePublicKey();

      const rsa = await build.build();

      const ciphertextBuffer = await rsa.encrypt(JSON.stringify(this.form));

      const signatureBuffer = await rsa.sign(ciphertextBuffer);

      const ciphertext = btoa(
        String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
      );
      const signature = btoa(
        String.fromCharCode(...new Uint8Array(signatureBuffer)),
      );

      const res = await rsaService.encryptedFirma({
        ciphertext,
        signature,
        clientPublicKey,
      });
      this.onProductAdded(res.data);
    } catch (error) {
      console.error('Error en encryptAndSignature:', error);
    }
  }

  /**
   * Descifra los datos de tarjeta usando RSA con clave privada local
   * 1. Crea un builder RSA en modo DECRYPT y obtiene la clave pública
   * 2. Envía la clave pública al servidor para obtener datos cifrados de tarjeta
   * 3. Descifra los datos usando la clave privada local y muestra el resultado
   */
  async decrypted() {
    try {
      const build = CryptoClient.RSA().builder().withMode(Mode.DECRYPT);
      const publicKey = await build.getPublicKey();
      const rsa = await build.build();
      const tarjetData = await rsaService.getTarjet(publicKey);
      const ciphertextBytes = base64ToUint8Array(tarjetData.ciphertext);

      const descriptedBuffer = await rsa.decrypt(ciphertextBytes);

      const decryptedText = new TextDecoder().decode(descriptedBuffer);
      console.log('✅ Tarjeta descifrada correctamente', decryptedText);
    } catch (error) {
      console.error('Error en decrypted:', error);
    }
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
    try {
      const build = CryptoClient.RSA()
        .builder()
        .withMode(Mode.DECRYPT)
        .withSignMode(SignMode.VERIFY);

      const publicKey = await build.getPublicKey();

      const tarjetData = await rsaService.getTarjetAndVerify(publicKey);
      await build.withRemoteSignaturePublicKey(tarjetData.publicKeySign);
      const rsa = await build.build();
      const ciphertextBytes = base64ToUint8Array(tarjetData.ciphertext);

      const descriptedBuffer = await rsa.decrypt(ciphertextBytes);

      const decryptedText = new TextDecoder().decode(descriptedBuffer);
      console.log(
        '✅ Tarjeta descifrada y Firma verificada correctamente',
        decryptedText,
      );
    } catch (error) {
      console.error('Error en decryptedAndVerify:', error);
    }
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
    try {
      const cardNumber = '1234-5678-9012-3456';

      const build = CryptoClient.RSA().builder().withSignMode(SignMode.SIGN);

      const publicKey = await build.getSignaturePublicKey();

      const rsa = await build.build();

      const cardNumberBytes = new TextEncoder().encode(cardNumber);

      const signatureBuffer = await rsa.sign(cardNumberBytes);

      const signatureBase64 = btoa(
        String.fromCharCode(...new Uint8Array(signatureBuffer)),
      );

      const res = await rsaService.verify({
        cardNumber,
        signature: signatureBase64,
        publicKey,
      });

      if (res.success) {
        console.log(
          '✅ Firma verificada correctamente en el servidor',
          res.data,
        );
      } else {
        console.error('❌ Error al verificar la firma:', res.message);
      }
    } catch (error) {
      console.error('Error en signature:', error);
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
    try {
      const cardNumber = '1234-5678-9012-3456';

      const signatureData = await rsaService.signature(cardNumber);

      if (!signatureData.success) {
        console.error(
          '❌ Error al obtener firma del servidor:',
          signatureData.message,
        );
        return;
      }

      const build = CryptoClient.RSA().builder().withSignMode(SignMode.VERIFY);

      await build.withRemoteSignaturePublicKey(signatureData.data.publicKey);

      const rsa = await build.build();

      const cardNumberBytes = new TextEncoder().encode(cardNumber);

      const signatureBytes = base64ToUint8Array(signatureData.data.signature);

      const isValid = await rsa.verify(cardNumberBytes, signatureBytes);

      if (isValid) {
        console.log('✅ Firma del servidor verificada correctamente', {
          cardNumber,
          verified: true,
        });
      } else {
        console.error('❌ La firma del servidor NO es válida');
      }
    } catch (error) {
      console.error('Error en verify:', error);
    }
  }
}
