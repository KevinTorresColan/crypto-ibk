/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// RSA
// ============================================================
export async function encryptWithPublicKeyRSA(publicKeyPem: string, data: any) {
  const serverPublicKey = transformKeyFormat(publicKeyPem);

  // Convertir PEM a CryptoKey
  const publicKey = await crypto.subtle.importKey(
    'spki',
    serverPublicKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt'],
  );

  // 1. Conviertes el string del usuario a bytes
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  // -> Uint8Array

  // 2. Encriptas esos bytes
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded,
  );
  // -> ArrayBuffer (ej: 256 bytes)

  // 3. Pasas el ArrayBuffer a un arreglo de bytes
  const bytes = new Uint8Array(encrypted);

  // 4. Convierte bytes a string (único formato que acepta btoa)
  const binaryString = String.fromCharCode(...bytes);

  // 5. Codificas ese string en Base64
  return btoa(binaryString);
}

// ============================================================
// RSA - DER
// ============================================================
export async function encryptWithPublicKeyRSADER(
  publicKeyDer: string,
  data: any,
) {
  const serverPublicKey = transformKeyFormat(publicKeyDer);

  // Convertir DER a CryptoKey
  const publicKey = await crypto.subtle.importKey(
    'spki',
    serverPublicKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt'],
  );

  // 1. Conviertes el string del usuario a bytes
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  // -> Uint8Array

  // 2. Encriptas esos bytes
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded,
  );
  // -> ArrayBuffer (ej: 256 bytes)

  // 3. Pasas el ArrayBuffer a un arreglo de bytes
  const bytes = new Uint8Array(encrypted);

  // 4. Convierte bytes a string (único formato que acepta btoa)
  const binaryString = String.fromCharCode(...bytes);

  // 5. Codificas ese string en Base64
  return btoa(binaryString);
}

// ============================================================
// RSA + signature (Auto-detect PEM/DER)
// ============================================================
export async function encryptWithPublicKeyRSAFirma(
  publicKey: string,
  data: any,
  privateKey: string,
) {
  const serverPublicKey = transformKeyFormat(publicKey);

  // 1. Convertir clave pública a CryptoKey para cifrado
  const publicCryptoKey = await crypto.subtle.importKey(
    'spki',
    serverPublicKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt'],
  );

  // 2. Convertir datos a bytes
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  // 3. Encriptar los datos
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicCryptoKey,
    encoded,
  );

  const encryptedBytes = new Uint8Array(encrypted);
  const binaryString = String.fromCharCode(...encryptedBytes);
  const ciphertext = btoa(binaryString);

  // 4. Importar clave privada para firmar (auto-detect PEM/DER)
  const clientPrivateKey = transformKeyFormat(privateKey);
  const privateCryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    clientPrivateKey,
    {
      name: 'RSA-PSS',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  // 5. Firmar el ciphertext
  const signature = await crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    privateCryptoKey,
    encrypted,
  );

  const signatureBytes = new Uint8Array(signature);
  const signatureBinaryString = String.fromCharCode(...signatureBytes);
  const signatureB64 = btoa(signatureBinaryString);

  return {
    ciphertext,
    signature: signatureB64,
  };
}

export async function generateRSAKeyPair() {
  // Generar par de claves RSA
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['sign', 'verify'],
  );

  // Exportar clave privada
  const privateKeyBuffer = await crypto.subtle.exportKey(
    'pkcs8',
    keyPair.privateKey,
  );
  const privateKeyPem = arrayBufferToPem(privateKeyBuffer, 'PRIVATE KEY');

  // Exportar clave pública
  const publicKeyBuffer = await crypto.subtle.exportKey(
    'spki',
    keyPair.publicKey,
  );
  const publicKeyPem = arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY');

  return {
    privateKeyPem,
    publicKeyPem,
  };
}

// ============================================================
// UTILS - PEM
// ============================================================

function arrayBufferToPem(buffer: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  // Formatear en líneas de 64 caracteres
  const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;

  return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
}

function pemToBinary(pem: string): ArrayBuffer {
  // Extrae todo lo que esté entre "-----BEGIN ...-----" y "-----END ...-----"
  const matches = pem.match(
    /-----BEGIN [\w\s]+-----([\s\S]+?)-----END [\w\s]+-----/,
  );
  const b64 = matches
    ? matches[1].replace(/\s+/g, '')
    : pem.replace(/\s+/g, '');

  // Decodificar Base64 a bytes (navegador)
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================================
// UTILS - DER
// ============================================================

function derToBinary(derBase64: string): ArrayBuffer {
  // Decodificar Base64 a bytes (navegador)
  const binary = atob(derBase64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================================
// UTILS
// ============================================================

function transformKeyFormat(key: string) {
  if (isPEM(key)) return pemToBinary(key);
  if (isDERBase64(key)) return derToBinary(key);

  throw new Error('Formato de clave desconocido. Debe ser PEM o DER Base64.');
}

function isPEM(key: string): boolean {
  return key.includes('-----BEGIN');
}

function isDERBase64(key: string): boolean {
  // Base64 válido y no contiene encabezados PEM
  return /^[A-Za-z0-9+/=]+$/.test(key) && !key.includes('BEGIN');
}
