/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import type { Product } from '../../interface/service';
import { CipherSuite, CryptoClient, ECCurve, Mode } from 'ibk-crypto';
import ProductForm from '../../components/ProductForm';
import { ecService } from '../../services/ec.service';
import { keyServices } from '../../services/keys.service';
import { base64ToUint8Array } from '../../utils/general';
import './styles.css';

interface OTECProps {
  handleProducts: (product: Product) => void;
}

const prefix = 'otec';

export const OTEC: React.FC<OTECProps> = ({ handleProducts }) => {
  const { getServerPublicKeyEC } = keyServices();
  const { encrypted, getTarjet } = ecService();
  const [form, setForm] = React.useState<Product | null>(null);

  const handleProductData = (data: Product) => {
    setForm(data);
  };

  /**
   * Cifra los datos del formulario usando OTEC (One-Time Elliptic Curve)
   * 1. Obtiene la clave pública del servidor
   * 2. Configura el builder OTEC con curva P-256, suite AES-256-GCM-SHA256 y modo cifrado
   * 3. Establece la clave pública remota del servidor
   * 4. Obtiene la clave pública local (efímera de un solo uso) para compartir
   * 5. Cifra los datos usando cipher.doFinal() y los convierte a base64
   * 6. Envía el payload con la clave efímera y el texto cifrado al servidor
   */
  const encrypt = async () => {
    try {
      const serverKey = await getServerPublicKeyEC();

      // Crear builder
      const builder = CryptoClient.OTEC()
        .builder()
        .withCurve(ECCurve.P256)
        .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
        .withMode(Mode.ENCRYPT);

      // Configurar clave remota
      await builder.withRemotePublicKey(serverKey);

      // Obtener clave pública local para enviar al servidor
      const localPublicKey = await builder.getPublicKey();

      // Construir cipher
      const cipher = await builder.build();

      // Cifrar datos
      const ciphertextBuffer = await cipher.doFinal(JSON.stringify(form));

      // Convertir a base64 para enviar
      const ciphertextBase64 = btoa(
        String.fromCharCode(...new Uint8Array(ciphertextBuffer)),
      );

      const payload = {
        ephemeralPublicKey: localPublicKey,
        ciphertext: ciphertextBase64,
      };

      console.log('EC Builder - SEND', payload);

      const res = await encrypted(payload);
      handleProducts(res.data);
    } catch (error) {
      console.error('Error en OTECEncrypt:', error);
    }
  };

  /**
   * Descifra datos encriptados recibidos del servidor usando OTEC
   * 1. Configura el builder OTEC con curva P-256, suite AES-256-GCM-SHA256 y modo descifrado
   * 2. Obtiene la clave pública local para enviar al servidor
   * 3. Solicita al servidor los datos cifrados de la tarjeta
   * 4. Establece la clave pública remota recibida del servidor
   * 5. Descifra el ciphertext usando cipher.doFinal() y muestra el resultado en consola
   */
  const decrypt = async () => {
    try {
      const builder = CryptoClient.OTEC()
        .builder()
        .withCurve(ECCurve.P256)
        .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
        .withMode(Mode.DECRYPT);

      // Obtener clave pública local para enviar al servidor
      const localPublicKey = await builder.getPublicKey();
      console.log('Clave pública local:', localPublicKey);

      // obtener dato de tarjeta encryptada
      const tarjet = await getTarjet({ ephemeralPublicKey: localPublicKey });
      console.log('Tarjet recibido:', tarjet);

      await builder.withRemotePublicKey(tarjet.serverPublicKey);

      const cipher = await builder.build();

      const ciphertextBytes = base64ToUint8Array(tarjet.ciphertext);

      // Algunos implementations aceptan ArrayBuffer o Uint8Array
      const inputForDoFinal: any = ciphertextBytes.buffer || ciphertextBytes;
      const decrypted = await cipher.doFinal(inputForDoFinal);

      // Normalizar resultado a ArrayBuffer
      const decryptedBuf =
        decrypted instanceof ArrayBuffer ? decrypted : decrypted;
      const plaintext = new TextDecoder().decode(new Uint8Array(decryptedBuf));
      console.log('Decrypted (builder):', plaintext);
    } catch (_error) {
      console.error('Error en decrypt con builder:', _error);
    }
  };

  return (
    <section className={`${prefix}__container`}>
      <h1 className={`${prefix}__title`}>OTEC</h1>
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
    </section>
  );
};
