/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import type { Product } from '../../interface/service';
import {
  CipherSuite,
  CryptoClient,
  ECCurve,
  HMACMode,
  Mode,
  SignMode,
} from 'ibk-crypto';
import ProductForm from '../../components/ProductForm';
import { ecService } from '../../services/ec.service';
import { keyServices } from '../../services/keys.service';
import { base64Encode, base64ToUint8Array } from '../../utils/general';
import './styles.css';

interface ECProps {
  handleProducts: (product: Product) => void;
}

const prefix = 'ec';

export const EC: React.FC<ECProps> = ({ handleProducts }) => {
  const { getServerPublicKeyEC, getHMacKey } = keyServices();
  const { encrypted, getTarjet, messageSignature, messageHMACSignature } =
    ecService();
  const [form, setForm] = React.useState<Product | null>(null);

  const handleProductData = (data: Product) => {
    setForm(data);
  };

  /**
   * Cifra los datos del formulario usando criptografía de curva elíptica (EC)
   * 1. Obtiene la clave pública del servidor
   * 2. Configura el builder con curva P-256, suite AES-256-GCM-SHA256 y modo cifrado
   * 3. Establece la clave pública remota del servidor
   * 4. Obtiene la clave pública local (efímera) para compartir con el servidor
   * 5. Cifra los datos del formulario y los convierte a base64
   * 6. Envía el payload con la clave efímera y el texto cifrado al servidor
   */
  const encrypt = async () => {
    const serverKey = await getServerPublicKeyEC();

    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256) // Usar la curva P-256 por defecto
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256) // Usar AES-256-GCM con SHA-256 por defecto
      .withMode(Mode.ENCRYPT);

    // Configurar clave remota
    await builder.withRemotePublicKey(serverKey);

    // Obtener clave pública local para enviar al servidor
    const localPublicKey = await builder.getPublicKey();

    // Construir cipher
    const cipher = await builder.build();

    // Cifrar datos
    const ciphertextBuffer = await cipher.encrypt(JSON.stringify(form));

    // Convertir a base64 para enviar
    const ciphertextBase64 = btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
    );

    const payload = {
      ephemeralPublicKey: localPublicKey,
      ciphertext: ciphertextBase64,
    };

    console.log('ENCRYPT - PAYLOAD', payload);

    const res = await encrypted(payload);
    handleProducts(res.data);
  };

  /**
   * Descifra datos encriptados recibidos del servidor usando EC
   * 1. Configura el builder con curva P-256, suite AES-256-GCM-SHA256 y modo descifrado
   * 2. Obtiene la clave pública local para enviar al servidor
   * 3. Solicita al servidor los datos cifrados de la tarjeta
   * 4. Establece la clave pública remota recibida del servidor
   * 5. Descifra el ciphertext y muestra el resultado en consola
   */
  const decrypt = async () => {
    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256)
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
      .withMode(Mode.DECRYPT);

    // Obtener clave pública local para enviar al servidor
    const localPublicKey = await builder.getPublicKey();

    // obtener dato de tarjeta encryptada
    const tarjet = await getTarjet({ ephemeralPublicKey: localPublicKey });
    await builder.withRemotePublicKey(tarjet.serverPublicKey);
    const cipher = await builder.build();
    const ciphertextBytes = base64ToUint8Array(tarjet.ciphertext);

    // Algunos implementations aceptan ArrayBuffer o Uint8Array
    const inputForDoFinal: any = ciphertextBytes.buffer || ciphertextBytes;
    const decrypted: ArrayBuffer = await cipher.decrypt(inputForDoFinal);
    // Normalizar resultado a ArrayBuffer
    const decryptedBuf =
      decrypted instanceof ArrayBuffer
        ? decrypted
        : decrypted.buffer || decrypted;
    const plaintext = new TextDecoder().decode(new Uint8Array(decryptedBuf));
    console.log('Decrypted (builder):', plaintext);
  };

  /**
   * Cifra los datos y genera una firma digital usando EC
   * 1. Obtiene la clave pública del servidor
   * 2. Configura el builder con curva P-256, suite AES-256-GCM-SHA256, modo cifrado y firma
   * 3. Establece la clave pública remota del servidor
   * 4. Cifra los datos del formulario
   * 5. Genera una firma digital del texto cifrado usando cipher.sign()
   * 6. Envía el payload con la clave efímera, texto cifrado, clave pública de firma y la firma
   */
  const encryptAndSignature = async () => {
    const serverKey = await getServerPublicKeyEC();

    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256)
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
      .withMode(Mode.ENCRYPT)
      .withSignMode(SignMode.SIGN);

    // Configurar clave remota
    await builder.withRemotePublicKey(serverKey);

    // Obtener clave pública local para enviar al servidor
    const localPublicKey = await builder.getPublicKey();

    // Construir cipher
    const cipher = await builder.build();

    // Cifrar datos
    const ciphertextBuffer = await cipher.encrypt(JSON.stringify(form));

    // Convertir a base64 para enviar
    const ciphertextBase64 = btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
    );

    // SIGNATURE
    const signaturePublicKey = await builder.getSignaturePublicKey();
    const signature = await cipher.sign(ciphertextBuffer);
    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signature)),
    );

    // RESULT PAYLOAD
    const payload = {
      ephemeralPublicKey: localPublicKey,
      ciphertext: ciphertextBase64,
      publicKeySign: signaturePublicKey,
      signature: signatureBase64,
    };

    console.log('EC Builder SIGNATURE - SEND', payload);

    const res = await encrypted(payload);
    handleProducts(res.data);
  };

  /**
   * Descifra datos y verifica la firma digital recibida del servidor
   * 1. Configura el builder con curva P-256, suite AES-256-GCM-SHA256, modo descifrado y verificación
   * 2. Obtiene la clave pública local para enviar al servidor
   * 3. Solicita al servidor los datos cifrados con firma
   * 4. Establece las claves públicas remotas (clave de cifrado y clave de firma)
   * 5. Verifica la firma digital usando cipher.verify()
   * 6. Descifra el ciphertext y muestra el resultado en consola
   */
  const decryptVerify = async () => {
    const builder = CryptoClient.EC()
      .builder()
      .withCurve(ECCurve.P256)
      .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
      .withMode(Mode.DECRYPT)
      .withSignMode(SignMode.VERIFY);
    // Obtener clave pública local para enviar al servidor
    const localPublicKey = await builder.getPublicKey();
    // obtener dato de tarjeta encryptada
    const tarjet = await getTarjet({
      ephemeralPublicKey: localPublicKey,
      hasSignature: true,
    });
    await builder.withRemoteSignaturePublicKey(tarjet.publicKeySign);
    await builder.withRemotePublicKey(tarjet.serverPublicKey);

    const cipher = await builder.build();
    const ciphertextBytes = base64ToUint8Array(tarjet.ciphertext);
    const signatureBytes = base64ToUint8Array(tarjet.signature);
    await cipher.verify(ciphertextBytes.buffer, signatureBytes.buffer);
    // Algunos implementations aceptan ArrayBuffer o Uint8Array
    const inputForDoFinal: any = ciphertextBytes.buffer || ciphertextBytes;
    const decrypted = await cipher.decrypt(inputForDoFinal);
    // Normalizar resultado a ArrayBuffer
    const decryptedBuf =
      decrypted instanceof ArrayBuffer ? decrypted : decrypted;
    const plaintext = new TextDecoder().decode(new Uint8Array(decryptedBuf));
    console.log('Decrypted (builder):', plaintext);
  };

  /**
   * Genera una firma digital de los datos del formulario sin cifrar
   * 1. Configura el builder solo con modo firma (sin cifrado)
   * 2. Obtiene la clave pública de firma para compartir
   * 3. Convierte los datos del formulario a ArrayBuffer
   * 4. Genera la firma digital usando cipher.sign()
   * 5. Convierte la firma a base64 y la muestra en consola
   */
  const signature = async () => {
    const builder = CryptoClient.EC().builder().withSignMode(SignMode.SIGN);
    const cipher = await builder.build();

    // SIGNATURE
    const signaturePublicKey = await builder.getSignaturePublicKey();
    const dataBuffer = new TextEncoder().encode(JSON.stringify(form));
    const signature = await cipher.sign(dataBuffer.buffer);

    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signature)),
    );
    console.log('Signature Base64:', {
      signature: signatureBase64,
      publicKey: signaturePublicKey,
    });
  };

  /**
   * Verifica una firma digital recibida del servidor
   * 1. Obtiene del servidor el mensaje, la firma y la clave pública de firma
   * 2. Configura el builder con modo verificación
   * 3. Establece la clave pública remota de firma
   * 4. Convierte el mensaje y la firma de base64 a ArrayBuffer
   * 5. Verifica la firma usando cipher.verify()
   * 6. Muestra confirmación si la verificación es exitosa
   */
  const verify = async () => {
    const data = await messageSignature();
    const builder = CryptoClient.EC().builder().withSignMode(SignMode.VERIFY);
    await builder.withRemoteSignaturePublicKey(data.publicKey);

    const cipher = await builder.build();

    // Convertir el mensaje (string) a ArrayBuffer
    const messageBuffer = new TextEncoder().encode(data.message).buffer;

    // Convertir la firma de base64 a ArrayBuffer
    const signatureBuffer = base64ToUint8Array(data.signature).buffer;

    // Verificar: requiere el mensaje original y la firma
    await cipher.verify(messageBuffer, signatureBuffer);

    console.log('✅ Firma verificada correctamente');
  };

  /**
   * Genera una firma HMAC usando una clave secreta compartida del servidor
   * 1. Obtiene la clave HMAC secreta del servidor
   * 2. Configura el builder con la clave HMAC remota
   * 3. Convierte los datos del formulario a ArrayBuffer
   * 4. Genera la firma HMAC usando cipher.hmacSign()
   * 5. Codifica la firma en base64 (doble codificación) y la muestra en consola
   */
  const HMACKeyServerSignature = async () => {
    const secret = await getHMacKey();
    const builder = CryptoClient.EC().builder();

    await builder.withRemoteHmacKey(secret);
    const cipher = await builder.build();

    const simulatePayloadBuffer = new TextEncoder().encode(
      JSON.stringify(form),
    );

    const signature = await cipher.hmacSign(simulatePayloadBuffer.buffer);

    const signatureArray = new Uint8Array(signature);
    const base64Signature = base64Encode(signatureArray);
    const doubleEncoded = btoa(base64Signature);

    console.log('HMAC Signature:', doubleEncoded);
  };

  /**
   * Genera una firma HMAC usando una clave interna generada automáticamente
   * 1. Configura el builder habilitando HMAC interno (genera su propia clave)
   * 2. Convierte los datos del formulario a ArrayBuffer
   * 3. Genera la firma HMAC usando cipher.hmacSign()
   * 4. Codifica la firma en base64 (doble codificación) y la muestra en consola
   */
  const HMACKeyInternalSignature = async () => {
    const builder = CryptoClient.EC().builder().withHMac(HMACMode.ENABLE);

    const cipher = await builder.build();

    const simulatePayloadBuffer = new TextEncoder().encode(
      JSON.stringify(form),
    );

    const signature = await cipher.hmacSign(simulatePayloadBuffer.buffer);

    const signatureArray = new Uint8Array(signature);
    const base64Signature = base64Encode(signatureArray);
    const doubleEncoded = btoa(base64Signature);

    console.log('HMAC Signature:', doubleEncoded);
  };

  /**
   * Verifica una firma HMAC recibida del servidor usando una clave compartida
   * 1. Obtiene del servidor el mensaje, la firma HMAC y la clave secreta
   * 2. Configura el builder con la clave HMAC remota
   * 3. Convierte el mensaje y la firma de base64 a ArrayBuffer
   * 4. Verifica la firma HMAC usando cipher.hmacVerify()
   * 5. Muestra confirmación si la verificación es exitosa
   */
  const HMACKeyServerVerify = async () => {
    const data = await messageHMACSignature();
    const builder = CryptoClient.EC().builder();
    await builder.withRemoteHmacKey(data.key);

    const cipher = await builder.build();

    // Convertir el mensaje (string) a ArrayBuffer
    const messageBuffer = new TextEncoder().encode(data.message).buffer;

    // Convertir la firma de base64 a ArrayBuffer
    const signatureBuffer = base64ToUint8Array(data.signature).buffer;

    // Verificar: requiere el mensaje original y la firma
    await cipher.hmacVerify(messageBuffer, signatureBuffer);

    console.log('✅ Firma verificada correctamente');
  };

  /**
   * Genera y verifica una firma HMAC usando una clave interna (caso de prueba local)
   * 1. Configura el builder habilitando HMAC interno
   * 2. Convierte el mensaje de prueba a ArrayBuffer
   * 3. Genera la firma HMAC del mensaje usando cipher.hmacSign()
   * 4. Verifica inmediatamente la firma usando cipher.hmacVerify()
   * 5. Muestra confirmación si la verificación es exitosa
   */
  const HMACKeyInternalVerify = async () => {
    const message = 'Mensaje a firmar HMAC local';
    const builder = CryptoClient.EC().builder().withHMac(HMACMode.ENABLE);

    const cipher = await builder.build();

    // Convertir el mensaje (string) a ArrayBuffer
    const messageBuffer = new TextEncoder().encode(message).buffer;

    // Firmar el mensaje con llave interna
    const signature = await cipher.hmacSign(messageBuffer);

    // Verificar: requiere el mensaje y la firma
    await cipher.hmacVerify(messageBuffer, signature);

    console.log('✅ Firma verificada correctamente');
  };

  return (
    <section className={`${prefix}__container`}>
      <h1 className={`${prefix}__title`}>EC</h1>
      <hr />
      <h3>Form</h3>
      <ProductForm onDataChange={handleProductData} />
      <h3>Encrypt</h3>
      <button className={`${prefix}__btn`} onClick={encrypt}>
        Encrypt
      </button>
      <h3>Decrypt</h3>
      <button className={`${prefix}__btn`} onClick={decrypt}>
        Decrypt
      </button>
      <h3>Encrypt and Signature</h3>
      <button className={`${prefix}__btn`} onClick={encryptAndSignature}>
        Encrypt and Signature
      </button>
      <h3>Decrypt and Verify</h3>
      <button className={`${prefix}__btn`} onClick={decryptVerify}>
        Decrypt and Verify
      </button>
      <h3>Signature</h3>
      <button className={`${prefix}__btn`} onClick={signature}>
        Signature
      </button>
      <h3>Verify</h3>
      <button className={`${prefix}__btn`} onClick={verify}>
        Verify
      </button>
      <h3>HMAC Key Server Signature</h3>
      <button className={`${prefix}__btn`} onClick={HMACKeyServerSignature}>
        HMAC Key Server Signature
      </button>
      <h3>HMAC Key Internal Signature</h3>
      <button className={`${prefix}__btn`} onClick={HMACKeyInternalSignature}>
        HMAC Key Internal Signature
      </button>
      <h3>HMAC Key Server Verify</h3>
      <button className={`${prefix}__btn`} onClick={HMACKeyServerVerify}>
        HMAC Key Server Verify
      </button>
      <h3>HMAC Key Internal Verify</h3>
      <button className={`${prefix}__btn`} onClick={HMACKeyInternalVerify}>
        HMAC Key Internal Verify
      </button>
    </section>
  );
};
