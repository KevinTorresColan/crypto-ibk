/* eslint-disable @typescript-eslint/no-explicit-any */

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++)
    str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

function base64ToArrayBuffer(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToPem(spkiOrDer: ArrayBuffer, header: string) {
  const b64 = arrayBufferToBase64(spkiOrDer);
  const chunked = b64.match(/.{1,64}/g)?.join('\n') || b64;
  return `-----BEGIN ${header}-----\n${chunked}\n-----END ${header}-----`;
}

function pemToArrayBuffer(pem: string) {
  const b64 = pem
    .replace(/-----BEGIN [\w\s]+-----/, '')
    .replace(/-----END [\w\s]+-----/, '')
    .replace(/\s+/g, '');

  return base64ToArrayBuffer(b64);
}

// Función para cifrar datos usando ECDH
export async function encryptWithServerEC(serverPublicPem: string, data: any) {
  const subtle = crypto.subtle;

  // 1) Import server public (SPKI PEM) as ECDH public key
  const serverPubBuf = pemToArrayBuffer(serverPublicPem);
  const serverPublicKey = await subtle.importKey(
    'spki',
    serverPubBuf,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  // 2) Generate ephemeral ECDH key pair (client)
  const clientECDH = await subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey'],
  );

  // 3) Derive AES-GCM 256 key
  const aesKey = await subtle.deriveKey(
    { name: 'ECDH', public: serverPublicKey },
    clientECDH.privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );

  // 4) Export ephemeral public (raw)
  const clientEphemeralRaw = await subtle.exportKey(
    'raw',
    clientECDH.publicKey,
  );
  const ephemeralPublicKeyB64 = arrayBufferToBase64(clientEphemeralRaw);

  // 5) Encrypt data with AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ctBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoded,
  );
  const ctB64 = arrayBufferToBase64(ctBuffer);
  const ivB64 = arrayBufferToBase64(iv.buffer);

  return {
    ephemeralPublicKey: ephemeralPublicKeyB64,
    iv: ivB64,
    ciphertext: ctB64,
    ciphertextBuffer: ctBuffer, // Para usar en la firma
  };
}

// Función para firmar datos usando ECDSA
export async function signDataWithECDSA(data: ArrayBuffer) {
  const subtle = crypto.subtle;

  // Generate a client ECDSA key pair (for signature). In prod this key should be persistent.
  const clientSignKey = await subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign'],
  );

  // Export public signing key (SPKI PEM) to send to server for verification
  const clientSignPublicSpki = await subtle.exportKey(
    'spki',
    clientSignKey.publicKey,
  );
  const clientPublicSignPem = arrayBufferToPem(
    clientSignPublicSpki,
    'PUBLIC KEY',
  );

  // Sign the data with ECDSA (DER signature)
  const signatureBuf = await subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    clientSignKey.privateKey,
    data,
  );
  const signatureB64 = arrayBufferToBase64(signatureBuf);

  return {
    signature: signatureB64,
    clientPublicSign: clientPublicSignPem, // SPKI PEM
  };
}

// Función combinada que usa las dos funciones anteriores
export async function encryptAndSignWithServerEC(
  serverPublicPem: string,
  data: any,
) {
  // 1) Cifrar los datos
  const encryptResult = await encryptWithServerEC(serverPublicPem, data);

  // 2) Firmar el texto cifrado
  const signResult = await signDataWithECDSA(encryptResult.ciphertextBuffer);

  return {
    ephemeralPublicKey: encryptResult.ephemeralPublicKey,
    iv: encryptResult.iv,
    ciphertext: encryptResult.ciphertext,
    signature: signResult.signature,
    clientPublicSign: signResult.clientPublicSign,
  };
}
