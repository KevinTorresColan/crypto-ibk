import { webcrypto } from 'crypto';
import fs from 'fs';
import path from 'path';
import { HMAC_SECRET_KEY } from '../../key-hmac/key.js';
import { b64ToArrayBuffer } from '../utils/convert.js';

const isPem = true;
// const isPem = false;

let productos = [];

let nextId = 0;

const subtle = webcrypto.subtle;

const keysDirEC = path.join(
  process.cwd(),
  isPem ? 'keys-ec-pem' : 'keys-ec-der',
);

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN [\w\s]+-----/, '')
    .replace(/-----END [\w\s]+-----/, '')
    .replace(/\s+/g, '');
  return Uint8Array.from(Buffer.from(b64, 'base64')).buffer;
}

const getServerPrivateKeyEC = () => {
  const p = path.join(keysDirEC, isPem ? 'ec_private.pem' : 'ec_private.der');
  if (!fs.existsSync(p)) throw new Error('Server EC private key not found');
  return fs.readFileSync(p, 'utf8');
};

// ============================================================
// Desencrypt + verify
// ============================================================
export const desencryptAndVerify = async (req, res) => {
  try {
    const { ciphertext, ephemeralPublicKey, signature, publicKeySign } =
      req.body;

    if (!ciphertext || !ephemeralPublicKey) {
      return res.status(400).json({
        success: false,
        message:
          'Faltan parámetros obligatorios (ciphertext, ephemeralPublicKey)',
      });
    }

    // ---------------------------
    // 1) Convertir base64 → bytes
    // ---------------------------
    const ctFull = b64ToArrayBuffer(ciphertext);
    const ctFullBytes = new Uint8Array(ctFull);

    // ---------------------------
    // VERIFICACIÓN DE FIRMA (si existe)
    // ---------------------------
    if (signature && publicKeySign) {
      console.log('🔐 Verificando firma digital...');

      try {
        // Importar clave pública de firma del cliente (SPKI)
        const signPubBuf = pemToArrayBuffer(publicKeySign);
        const clientSignPubKey = await subtle.importKey(
          'spki',
          signPubBuf,
          { name: 'ECDSA', namedCurve: 'P-256' },
          false,
          ['verify'],
        );

        // Convertir firma de base64 a buffer
        const signatureBuf = b64ToArrayBuffer(signature);

        // Verificar firma sobre el ciphertext completo
        const isValid = await subtle.verify(
          { name: 'ECDSA', hash: 'SHA-256' },
          clientSignPubKey,
          signatureBuf,
          ctFull,
        );

        if (!isValid) {
          console.log('❌ Firma inválida');
          return res.status(401).json({
            success: false,
            message: 'Firma digital inválida',
          });
        }

        console.log('✅ Firma verificada correctamente');
      } catch (signErr) {
        console.error('Error al verificar firma:', signErr);
        return res.status(401).json({
          success: false,
          message: 'Error al verificar la firma digital',
        });
      }
    }

    // IV = primeros 12 bytes
    const iv = ctFullBytes.slice(0, 12);

    // Ciphertext + tag = resto
    const cipherBytes = ctFullBytes.slice(12);

    // ---------------------------
    // 2) Importar clave privada EC del servidor (PKCS8)
    // ---------------------------
    const privDir = path.join(process.cwd(), 'keys-ec-pem');
    const privPem = fs.readFileSync(
      path.join(privDir, 'ec_private.pem'),
      'utf8',
    );
    const privBuf = pemToArrayBuffer(privPem);

    const serverPrivateKey = await subtle.importKey(
      'pkcs8',
      privBuf,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveBits'],
    );

    // ---------------------------
    // 3) Importar clave pública efímera SPKI
    // ---------------------------
    const ephBuf = b64ToArrayBuffer(ephemeralPublicKey);

    const clientEphemeralKey = await subtle.importKey(
      'spki',
      ephBuf,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    );

    // ---------------------------
    // 4) Derivar shared secret (raw bits)
    // ---------------------------
    const sharedSecret = await subtle.deriveBits(
      { name: 'ECDH', public: clientEphemeralKey },
      serverPrivateKey,
      256,
    );

    // ---------------------------
    // 5) Hash( sharedSecret ) → truncate 32 bytes (AES-256)
    // ---------------------------
    const hashed = await subtle.digest('SHA-256', sharedSecret);
    const aesKeyBytes = new Uint8Array(hashed).slice(0, 32);

    const aesKey = await subtle.importKey(
      'raw',
      aesKeyBytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    // ---------------------------
    // 6) Decrypt AES-GCM
    // ---------------------------
    const decrypted = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      cipherBytes,
    );

    const json = new TextDecoder().decode(decrypted);
    const data = JSON.parse(json);

    // ---------------------------
    // 7) Crear producto
    // ---------------------------
    const nuevo = {
      id: nextId++,
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock ?? 0,
    };

    productos.push(nuevo);

    const message = signature
      ? 'Producto agregado exitosamente (EC con firma verificada)'
      : 'Producto agregado exitosamente (EC)';

    res.status(201).json({
      success: true,
      message,
      data: nuevo,
    });
  } catch (err) {
    console.error('Error EC Kotlin compatible:', err);
    res.status(400).json({
      success: false,
      message: 'No se pudo procesar el mensaje EC Kotlin compatible',
    });
  }
};

// ============================================================
// Encrypt + signature
// ============================================================
export const EncryptedAndVerifySendTarjet = async (req, res) => {
  try {
    const { ephemeralPublicKey, hasSignature } = req.body;

    if (!ephemeralPublicKey) {
      return res
        .status(400)
        .json({ success: false, message: 'Falta ephemeralPublicKey' });
    }

    const tarjet = '1234-5678-9012-3456';

    // 1) Convertir ephemeralPublicKey (base64) -> ArrayBuffer
    const ephBuf = b64ToArrayBuffer(ephemeralPublicKey);

    // 2) Importar la clave privada del servidor (PKCS8) como CryptoKey ECDH
    let serverPrivKey;
    if (isPem) {
      const privPem = getServerPrivateKeyEC();
      const privBuf = pemToArrayBuffer(privPem);
      serverPrivKey = await subtle.importKey(
        'pkcs8',
        privBuf,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveBits'],
      );
    } else {
      const privDir = path.join(process.cwd(), 'keys-ec-der');
      const privDer = fs.readFileSync(path.join(privDir, 'ec_private.der'));
      const privBuf = new Uint8Array(privDer).buffer;
      serverPrivKey = await subtle.importKey(
        'pkcs8',
        privBuf,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveBits'],
      );
    }

    // 3) Importar public key efímera del cliente (SPKI)
    const clientEphemeralKey = await subtle.importKey(
      'spki',
      ephBuf,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    );

    // 4) Derivar shared secret (raw bits)
    const sharedSecret = await subtle.deriveBits(
      { name: 'ECDH', public: clientEphemeralKey },
      serverPrivKey,
      256,
    );

    // 5) Hash(sharedSecret) -> truncate 32 bytes (AES-256)
    const hashed = await subtle.digest('SHA-256', sharedSecret);
    const aesKeyBytes = new Uint8Array(hashed).slice(0, 32);

    const aesKey = await subtle.importKey(
      'raw',
      aesKeyBytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt'],
    );

    // 6) Generar IV (12 bytes) y cifrar con AES-GCM
    const iv = new Uint8Array(12);
    if (typeof webcrypto?.getRandomValues === 'function') {
      webcrypto.getRandomValues(iv);
    } else if (typeof crypto?.randomFillSync === 'function') {
      crypto.randomFillSync(iv);
    } else {
      // fallback insecure (shouldn't happen in Node >= 16)
      for (let i = 0; i < iv.length; i++)
        iv[i] = Math.floor(Math.random() * 256);
    }

    const plainBuf = new TextEncoder().encode(tarjet);

    const cipherBuf = await subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      aesKey,
      plainBuf,
    );

    const cipherBytes = new Uint8Array(cipherBuf);

    // 7) Concatenar IV + ciphertext+tag
    const combined = new Uint8Array(iv.length + cipherBytes.length);
    combined.set(iv, 0);
    combined.set(cipherBytes, iv.length);

    const ciphertextB64 = Buffer.from(combined).toString('base64');

    // 8) Enviar también la clave pública del servidor (SPKI) en base64 para que el cliente derive la misma clave
    let serverPubB64;
    if (isPem) {
      const pubPemPath = path.join(keysDirEC, 'ec_public.pem');
      if (!fs.existsSync(pubPemPath))
        throw new Error('Server EC public key not found');
      const pubPem = fs.readFileSync(pubPemPath, 'utf8');
      const pubSpki = pemToArrayBuffer(pubPem);
      serverPubB64 = Buffer.from(new Uint8Array(pubSpki)).toString('base64');
    } else {
      const pubDerPath = path.join(keysDirEC, 'ec_public.der');
      if (!fs.existsSync(pubDerPath))
        throw new Error('Server EC public key not found');
      const pubDer = fs.readFileSync(pubDerPath);
      serverPubB64 = Buffer.from(pubDer).toString('base64');
    }

    // ---------------------------
    // GENERACIÓN DE FIRMA (si se requiere)
    // ---------------------------
    let signatureB64;
    let signaturePublicKeyB64;

    if (hasSignature) {
      console.log('🔐 Generando firma digital del servidor...');

      try {
        // Generar par de claves ECDSA para firma
        const signKeyPair = await subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' },
          true,
          ['sign', 'verify'],
        );

        // Firmar el ciphertext
        const signatureBuf = await subtle.sign(
          { name: 'ECDSA', hash: 'SHA-256' },
          signKeyPair.privateKey,
          combined,
        );

        signatureB64 = Buffer.from(new Uint8Array(signatureBuf)).toString(
          'base64',
        );

        // Exportar clave pública de firma en formato SPKI
        const signPubKeyExported = await subtle.exportKey(
          'spki',
          signKeyPair.publicKey,
        );
        signaturePublicKeyB64 = Buffer.from(
          new Uint8Array(signPubKeyExported),
        ).toString('base64');

        console.log('✅ Firma generada correctamente');
      } catch (signErr) {
        console.error('Error al generar firma:', signErr);
        return res.status(500).json({
          success: false,
          message: 'Error al generar la firma digital',
        });
      }
    }

    const response = {
      success: true,
      ciphertext: ciphertextB64,
      serverPublicKey: serverPubB64,
    };

    // Agregar firma y clave pública de firma si se solicitó
    if (hasSignature && signatureB64 && signaturePublicKeyB64) {
      response.signature = signatureB64;
      response.publicKeySign = signaturePublicKeyB64;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('Error en getTarjetEncryptedAndSend:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
    });
  }
};

// ============================================================
// Signature
// ============================================================
export const signMessage = async (_req, res) => {
  const message = 'Mensaje a firmar';

  // Generar par de claves ECDSA para firma
  const signKeyPair = await subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  );

  // Firmar el mensaje
  const messageBuf = new TextEncoder().encode(message);
  const signatureBuf = await subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signKeyPair.privateKey,
    messageBuf,
  );

  // Exportar clave pública de firma en formato SPKI
  const signPubKeyExported = await subtle.exportKey(
    'spki',
    signKeyPair.publicKey,
  );

  res.status(200).json({
    success: true,
    message: message, // ✅ Mensaje original necesario para verificar
    signature: Buffer.from(new Uint8Array(signatureBuf)).toString('base64'),
    publicKey: Buffer.from(new Uint8Array(signPubKeyExported)).toString(
      'base64',
    ),
  });
};

export const signHMACMessage = async (_req, res) => {
  const message = 'Mensaje a firmar HMAC';

  // Generar clave HMAC
  const hmacKey = await subtle.importKey(
    'raw',
    new TextEncoder().encode(HMAC_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );

  // Firmar el mensaje
  const messageBuf = new TextEncoder().encode(message);
  const signatureBuf = await subtle.sign({ name: 'HMAC' }, hmacKey, messageBuf);

  res.status(200).json({
    success: true,
    message: message, // ✅ Mensaje original necesario para verificar
    signature: Buffer.from(new Uint8Array(signatureBuf)).toString('base64'),
    key: HMAC_SECRET_KEY,
  });
};
