/* eslint-disable @typescript-eslint/no-explicit-any */
// typescript - webcrypto compatible
type CipherSuiteName =
  | 'AES_256_GCM_SHA256'
  | 'AES_192_GCM_SHA256'
  | 'AES_128_GCM_SHA256'
  | 'AES_256_GCM_SHA384';

interface EncryptResult {
  ephemeralPublicKey: string; // SPKI (X.509) base64 — backend espera esto para importar
  ciphertext: string; // iv + cipherText + tag (concatenado), como lo hace AESGCMCipher.encrypt() en Kotlin
  cipherSuite?: CipherSuiteName; // opcional
  curve?: 'P-256' | 'P-384' | 'P-521'; // opcional
  // extras (no obligatorios)
  ivB64?: string; // si quieres enviar IV por separado (no es necesario si iv está prepended)
}

/**
 * Utilidades (las tuyas adaptadas)
 */
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

function pemToArrayBuffer(pem: string) {
  const b64 = pem
    .replace(/-----BEGIN [\w\s]+-----/, '')
    .replace(/-----END [\w\s]+-----/, '')
    .replace(/\s+/g, '');
  return base64ToArrayBuffer(b64);
}

/**
 * encryptWithServerEC: versión que intenta reflejar lo que hace la librería Kotlin.
 *
 * Notas:
 * - Exportamos ephemeral public key como SPKI (X.509) porque en Kotlin/Java `PublicKey.encoded`
 *   suele ser el formato X.509/SubjectPublicKeyInfo (SPKI).
 * - Derivación de clave: implementa exactamente el proceso "hash(dhSharedSecret)" y truncamiento
 *   para producir la clave AES (igual que SecretKeyDeriver en Kotlin).
 * - El ciphertext devuelto se construye como: iv || ciphertextFull (Kotlin hace iv + cipherText).
 */
export async function encryptWithServerEC(
  serverPublicSpkiOrPem: string, // SPKI base64 string or PEM (SPKI PEM)
  data: string | ArrayBuffer | object,
  opts?: {
    curve?: 'P-256' | 'P-384' | 'P-521'; // Por defecto P-256 para compatibilidad con Kotlin SECP256R1
    cipherSuite?: CipherSuiteName; // por defecto AES_256_GCM_SHA256
    tagLength?: 96 | 104 | 112 | 120 | 128; // por defecto 128
    ivLength?: 12; // por defecto 12 bytes
  },
): Promise<EncryptResult> {
  const subtle = crypto.subtle;
  const curve = opts?.curve ?? 'P-256';
  const cipherSuite = opts?.cipherSuite ?? 'AES_256_GCM_SHA256';
  const tagLength = opts?.tagLength ?? 128;
  const ivLength = opts?.ivLength ?? 12;
  // ---------------------------
  // 1) Import server public key (SPKI)
  // Kotlin mapping: esto corresponde a cuando tests/ejemplo usan KeyFactory.getInstance("EC").generatePublic(X509EncodedKeySpec(publicBytes))
  // Kotlin: remotePublicKey = KeyFactory... X509EncodedKeySpec(remoteBytes)  (publicKey.encoded -> X.509)
  // ---------------------------
  const serverPubBuf = serverPublicSpkiOrPem.trim().startsWith('-----BEGIN')
    ? pemToArrayBuffer(serverPublicSpkiOrPem)
    : base64ToArrayBuffer(serverPublicSpkiOrPem); // accept either

  const serverPublicKey = await subtle.importKey(
    'spki',
    serverPubBuf,
    { name: 'ECDH', namedCurve: curve },
    false,
    [], // public key: no key usages
  );

  // ---------------------------
  // 2) Generate ephemeral ECDH key pair (client)
  // Kotlin mapping: KeyPairGenerator.generateEC(curve) -> localKeys
  // Kotlin stores localKeys.public -> publicKey for exchange
  // ---------------------------
  // Generar par de claves ECDH efímero
  const clientPair = await subtle.generateKey(
    { name: 'ECDH', namedCurve: curve },
    true, // extractable because we will export the public key
    ['deriveBits'], // deriveBits to get raw shared secret
  );

  // ---------------------------
  // 3) Derive raw shared secret bits using ECDH
  // Kotlin mapping: SharedSecretDeriver.derive(KeyAgreementAlgorithm.ECDH, localPrivate, remotePublic)
  // In Kotlin they call KeyAgreement.getInstance("ECDH")...generateSecret() -> returns byte[]
  // In WebCrypto: subtle.deriveBits returns an ArrayBuffer with raw shared secret bits (length depends on curve).
  // ---------------------------
  // length in bits: for P-256 shared secret length is 256

  // conseguir bits secreto compartido atraves de llave ephemera privada y llave publica del servidor
  const sharedSecretBits = await subtle.deriveBits(
    { name: 'ECDH', public: serverPublicKey },
    clientPair.privateKey,
    // deriveBits requires bit length; use curve size:
    curve === 'P-256' ? 256 : curve === 'P-384' ? 384 : 521,
  ); // ArrayBuffer

  // ---------------------------
  // 4) Derive symmetric key the same way Kotlin's SecretKeyDeriver does:
  // Kotlin: val hash = MessageDigest.getInstance(cipherSuite.hashAlgorithm.value)
  //         val derivedKey = hash.digest(secret)
  //         SecretKeySpec(derivedKey, 0, cipherSuite.keySize.bitsToBytes, cipherSuite.algorithm.value)
  //
  // We'll:
  //   - hash = subtle.digest(SHA-256 or SHA-384 as required)
  //   - take the first N bytes where N = keySize/8 (e.g., 32 for 256)
  //   - import those raw bytes as AES-GCM key
  //
  // This guarantees compatibility with Kotlin's derivation if Kotlin uses the same hash alg.
  // ---------------------------
  // Determine hash algorithm and key length from cipherSuite

  // Elegir algoritmo hash y tamaño clave segun cipherSuite
  const hashAlg = cipherSuite.includes('SHA384') ? 'SHA-384' : 'SHA-256';
  const keySizeBits = cipherSuite.startsWith('AES_256')
    ? 256
    : cipherSuite.startsWith('AES_192')
      ? 192
      : 128;
  const keySizeBytes = keySizeBits / 8;

  // Compute hash(sharedSecret)

  // calcular hash del secreto compartido
  const hashed = await subtle.digest(hashAlg, sharedSecretBits); // ArrayBuffer

  // Truncate / take first keySizeBytes
  const hashedBytes = new Uint8Array(hashed);
  const aesKeyBytes = hashedBytes.slice(0, keySizeBytes).buffer; // ArrayBuffer length keySizeBytes

  // Import AES key from raw bytes (non-extractable to match Kotlin's SecretKeySpec behavior; here we must import as extractable=false)
  // Clave simetrica AES-GCM
  const aesKey = await subtle.importKey(
    'raw',
    aesKeyBytes,
    { name: 'AES-GCM', length: keySizeBits },
    false,
    ['encrypt'], // in this function we only need encrypt usage
  );

  // ---------------------------
  // 5) Encrypt data using AES-GCM
  // Kotlin AESGCMCipher uses:
  //   - Default IV length 12 bytes
  //   - Default Tag 128 bits (but tag is produced by the cipher)
  //   - It returns iv + cipherText (prepended)
  // We'll do the same: produce iv, encrypt, then concat iv + ciphertext
  // ---------------------------
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const plainBuffer =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(data as any);

  // ciphertext + authentication tag | [CIPHERTEXT ...][TAG 16 bytes]
  const cipherBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength,
    },
    aesKey,
    plainBuffer,
  );

  // Kotlin returns iv + cipherText (where cipherText includes tag). We'll replicate:
  // | 12 bytes IV | ciphertext variable length | 16 bytes TAG
  const ivPlusCipher = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
  ivPlusCipher.set(iv, 0);
  ivPlusCipher.set(new Uint8Array(cipherBuffer), iv.byteLength);

  // ---------------------------
  // 6) Export ephemeral public key as SPKI (X.509) so backend Java/Kotlin can import it via X509EncodedKeySpec
  // Kotlin mapping: publicKey.encoded  (which is X.509 / SPKI)
  // WebCrypto can exportKey("spki", publicKey)
  // ---------------------------
  const clientEphemeralSpki = await subtle.exportKey(
    'spki',
    clientPair.publicKey,
  ); // ArrayBuffer
  const ephemeralPublicKeySpkiB64 = arrayBufferToBase64(clientEphemeralSpki);
  const ciphertextB64 = arrayBufferToBase64(ivPlusCipher.buffer);

  return {
    ephemeralPublicKey: ephemeralPublicKeySpkiB64,
    ciphertext: ciphertextB64,
    cipherSuite,
    curve,
    ivB64: arrayBufferToBase64(iv.buffer), // optional
  };
}
