import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const isPem = true;
// const isPem = false;

let productos = [
  { id: 1, nombre: 'Laptop', precio: 999.99, stock: 10 },
  { id: 2, nombre: 'Mouse', precio: 29.99, stock: 50 },
  { id: 3, nombre: 'Teclado', precio: 79.99, stock: 30 },
];

let nextId = 4;

export const getAllProducts = (req, res) => {
  res.json({
    success: true,
    data: productos,
    total: productos.length,
  });
};

// ============================================================
// RSA
// ============================================================
// const keysDirRSA = path.join(process.cwd(), isPem ? "keys-rsa-pem": "keys-rsa-der");

// ============================================================
// RSA + encrypt + PEM
// ============================================================
export const createProductEncryptedRSA = (req, res) => {
  try {
    const { ciphertext } = req.body;
    console.log('RSA + encrypt + PEM');

    const buffer = Buffer.from(ciphertext, 'base64');
    const keysDirRSA = path.join(process.cwd(), 'keys-rsa-pem');
    const key = fs.readFileSync(path.join(keysDirRSA, 'private.pem'), 'utf8');

    const decrypted = crypto.privateDecrypt(
      {
        key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );

    const data = JSON.parse(decrypted.toString());

    const nuevoProducto = {
      id: nextId++,
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock || 0,
    };

    productos.push(nuevoProducto);

    res.status(201).json({
      success: true,
      message: 'Producto agregado exitosamente',
      data: nuevoProducto,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'No se pudo descifrar',
    });
  }
};

// ============================================================
// RSA + encrypt + DER
// ============================================================
export const createProductEncryptedRSADER = (req, res) => {
  try {
    const { ciphertext } = req.body;
    console.log('RSA + encrypt + DER');

    const buffer = Buffer.from(ciphertext, 'base64');
    const keysDirRSA = path.join(process.cwd(), 'keys-rsa-der');
    const key = fs.readFileSync(path.join(keysDirRSA, 'private.der'));

    const decrypted = crypto.privateDecrypt(
      {
        key,
        format: 'der',
        type: 'pkcs8',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );

    const data = JSON.parse(decrypted.toString());

    const nuevoProducto = {
      id: nextId++,
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock || 0,
    };

    productos.push(nuevoProducto);

    res.status(201).json({
      success: true,
      message: 'Producto agregado exitosamente (DER)',
      data: nuevoProducto,
    });
  } catch (error) {
    console.error('Error en createProductEncryptedRSADER:', error);
    res.status(400).json({
      success: false,
      message: `No se pudo descifrar (DER): ${error.message}`,
    });
  }
};

// ============================================================
// RSA + encrypt + FIRMA + PEM
// ============================================================
export const createProductEncryptedRSAFirma = async (req, res) => {
  try {
    const { ciphertext, signature, clientPublicKey } = req.body;
    console.log('RSA + encrypt + FIRMA + PEM');

    // 1. Descifrar el ciphertext con la clave privada del servidor
    const keysDirRSA = path.join(process.cwd(), 'keys-rsa-pem');
    const key = fs.readFileSync(path.join(keysDirRSA, 'private.pem'), 'utf8');
    const buffer = Buffer.from(ciphertext, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );

    const data = JSON.parse(decrypted.toString());

    // 2. Verificar la firma con la clave pública del cliente
    if (clientPublicKey && signature) {
      const signatureBuffer = Buffer.from(signature, 'base64');

      const isValid = crypto.verify(
        'sha256',
        buffer,
        {
          key: clientPublicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: 32,
        },
        signatureBuffer,
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Firma inválida',
        });
      }
    }

    // 3. Crear el producto
    const nuevoProducto = {
      id: nextId++,
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock || 0,
    };

    productos.push(nuevoProducto);

    res.status(201).json({
      success: true,
      message: 'Producto agregado exitosamente con firma',
      data: nuevoProducto,
    });
  } catch (error) {
    console.error('Error en createProductEncryptedRSAFirma:', error);
    res.status(400).json({
      success: false,
      message: 'No se pudo descifrar o verificar la firma',
    });
  }
};

// ============================================================
// RSA + encrypt + FIRMA + DER
// ============================================================
export const createProductEncryptedRSADERFirma = async (req, res) => {
  try {
    const { ciphertext, signature, clientPublicKey } = req.body;
    console.log('RSA + encrypt + FIRMA + DER');

    const keysDirRSA = path.join(process.cwd(), 'keys-rsa-der');
    const key = fs.readFileSync(path.join(keysDirRSA, 'private.der'));

    // 1. Descifrar el ciphertext con la clave privada del servidor
    const buffer = Buffer.from(ciphertext, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key,
        format: 'der',
        type: 'pkcs8',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );

    const data = JSON.parse(decrypted.toString());

    // 2. Verificar la firma con la clave pública del cliente
    if (clientPublicKey && signature) {
      const signatureBuffer = Buffer.from(signature, 'base64');

      const isValid = crypto.verify(
        'sha256',
        buffer,
        {
          key: Buffer.from(clientPublicKey, 'base64'),
          format: 'der',
          type: 'spki',
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: 32,
        },
        signatureBuffer,
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Firma inválida',
        });
      }
    }

    // 3. Crear el producto
    const nuevoProducto = {
      id: nextId++,
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock || 0,
    };

    productos.push(nuevoProducto);

    res.status(201).json({
      success: true,
      message: 'Producto agregado exitosamente con firma',
      data: nuevoProducto,
    });
  } catch (error) {
    console.error('Error en createProductEncryptedRSADERFirma:', error);
    res.status(400).json({
      success: false,
      message: 'No se pudo descifrar o verificar la firma',
    });
  }
};

// ============================================================
// EC
// ============================================================
import { webcrypto } from 'crypto';
const subtle = webcrypto.subtle;

const keysDirEC = path.join(
  process.cwd(),
  isPem ? 'keys-ec-pem' : 'keys-ec-der',
);

const b64ToArrayBuffer = (b64) =>
  Uint8Array.from(Buffer.from(b64, 'base64')).buffer;

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
// EC + encrypt + FIRMA + PEM
// ============================================================
export const createProductEncryptedECFirma = async (req, res) => {
  try {
    // Expect body: { ephemeralPublicKey, iv, ciphertext, signature, clientPublicSign }
    const {
      ephemeralPublicKey: epkB64,
      iv: ivB64,
      ciphertext: ctB64,
      signature: sigB64,
      clientPublicSign,
    } = req.body;

    // 0) Convert base64 -> ArrayBuffer
    const ctBuf = b64ToArrayBuffer(ctB64);
    const ivBuf = b64ToArrayBuffer(ivB64);
    const sigBuf = b64ToArrayBuffer(sigB64);

    // 1) IMPORTAR la public key del cliente (ECDSA) para verificar la firma
    // clientPublicSign is PEM (SPKI)
    const clientPubSpki = pemToArrayBuffer(clientPublicSign);
    const clientPubKey = await subtle.importKey(
      'spki',
      clientPubSpki,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );

    // 2) Verificar firma sobre ciphertext (puedes cambiar a firmar iv||ciphertext etc.)
    const valid = await subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      clientPubKey,
      sigBuf,
      ctBuf,
    );

    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: 'Firma inválida' });
    }

    // 3) Importar la clave privada del servidor (PKCS8 PEM) como CryptoKey ECDH
    const serverPrivatePem = getServerPrivateKeyEC();
    const serverPkcs8 = pemToArrayBuffer(serverPrivatePem);
    const serverPrivKey = await subtle.importKey(
      'pkcs8',
      serverPkcs8,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveKey', 'deriveBits'],
    );

    // 4) Importar ephemeralPublicKey (raw) del cliente
    const clientEphemeralRaw = b64ToArrayBuffer(epkB64);
    const clientEphemeralKey = await subtle.importKey(
      'raw',
      clientEphemeralRaw,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    );

    // 5) Derivar clave AES-GCM 256
    const derivedKey = await subtle.deriveKey(
      { name: 'ECDH', public: clientEphemeralKey },
      serverPrivKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    // 6) Descifrar con AES-GCM
    const decrypted = await subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuf) },
      derivedKey,
      ctBuf,
    );

    const dataJson = new TextDecoder().decode(decrypted);
    const data = JSON.parse(dataJson);

    const nuevoProducto = {
      id: nextId++,
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock || 0,
    };
    productos.push(nuevoProducto);

    res.status(201).json({ success: true, data: nuevoProducto });
  } catch (err) {
    console.error('Error decrypt/verify:', err);
    res
      .status(400)
      .json({ success: false, message: 'No se pudo procesar el mensaje' });
  }
};

// ============================================================
// EC + new + desencrypt + PEM + verify
// ============================================================
export const createProductEncryptedEC = async (req, res) => {
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
// EC + new + encrypt + PEM + signature
// ============================================================
export const getTarjetEncryptedAndSend = async (req, res) => {
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
// EC + new + desencrypt + DER
// ============================================================
export const createProductEncryptedECDER = async (req, res) => {
  try {
    const { ciphertext, ephemeralPublicKey } = req.body;

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

    // IV = primeros 12 bytes
    const iv = ctFullBytes.slice(0, 12);

    // Ciphertext + tag = resto
    const cipherBytes = ctFullBytes.slice(12);

    // ---------------------------
    // 2) Importar clave privada EC del servidor (PKCS8 DER)
    // ---------------------------
    const privDir = path.join(process.cwd(), 'keys-ec-der');
    const privDer = fs.readFileSync(path.join(privDir, 'ec_private.der'));
    const privBuf = new Uint8Array(privDer).buffer;

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

    res.status(201).json({
      success: true,
      message: 'Producto agregado exitosamente (EC Kotlin compatible DER)',
      data: nuevo,
    });
  } catch (err) {
    console.error('Error EC Kotlin compatible DER:', err);
    res.status(400).json({
      success: false,
      message: 'No se pudo procesar el mensaje EC Kotlin compatible DER',
    });
  }
};
