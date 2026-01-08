import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let productos = [];

let nextId = 4;

// ============================================================
// RSA + decrypt
// ============================================================
export const decrypted = (req, res) => {
  try {
    const { ciphertext } = req.body;
    console.log('RSA + decrypt');

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
// RSA + encrypt + FIRMA
// ============================================================
export const decryptedSignature = async (req, res) => {
  try {
    const { ciphertext, signature, clientPublicKey } = req.body;
    console.log('RSA + encrypt + FIRMA');

    // 1. Descifrar el ciphertext con la clave privada del servidor
    const keysDirRSA = path.join(process.cwd(), 'keys-rsa-der');
    const key = fs.readFileSync(path.join(keysDirRSA, 'private.der'));
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
    console.error('Error en createProductEncryptedRSAFirma:', error);
    res.status(400).json({
      success: false,
      message: 'No se pudo descifrar o verificar la firma',
    });
  }
};

// ============================================================
// RSA + encrypt
// ============================================================
export const encrypted = (req, res) => {
  try {
    console.log('RSA + encrypt + PEM');

    const { publicKey } = req.body;
    const tarjet = '1234-5678-9012-3456';

    const buffer = Buffer.from(tarjet, 'utf8');

    // La clave viene en base64 y está en formato SPKI (DER), no PEM
    const keyBuffer = Buffer.from(publicKey, 'base64');

    const encrypted = crypto.publicEncrypt(
      {
        key: keyBuffer,
        format: 'der',
        type: 'spki',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );

    const ciphertext = encrypted.toString('base64');

    res.status(200).json({
      success: true,
      ciphertext,
    });
  } catch (error) {
    console.error('Error en encryptedPEM:', error);
    res.status(400).json({
      success: false,
      message: `No se pudo cifrar (PEM): ${error.message}`,
    });
  }
};

// ============================================================
// RSA + encrypt + SIGN
// ============================================================
export const encryptedAndSign = (req, res) => {
  try {
    console.log('RSA + encrypt + SIGN');

    const { publicKey } = req.body;
    const tarjet = '1234-5678-9012-3456';

    const buffer = Buffer.from(tarjet, 'utf8');

    // 1. Cifrar con la clave pública del cliente (DER)
    const keyBuffer = Buffer.from(publicKey, 'base64');

    const encrypted = crypto.publicEncrypt(
      {
        key: keyBuffer,
        format: 'der',
        type: 'spki',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );

    const ciphertext = encrypted.toString('base64');

    // // 2. Firmar el ciphertext con la clave privada del servidor (DER)
    const keysDirRSA = path.join(process.cwd(), 'keys-rsa-der');
    const privateKey = fs.readFileSync(path.join(keysDirRSA, 'private.der'));

    const signature = crypto.sign('sha256', encrypted, {
      key: privateKey,
      format: 'der',
      type: 'pkcs8',
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    });

    const signatureBase64 = signature.toString('base64');

    // 3. Leer la clave pública del servidor para enviarla al cliente
    const serverPublicKey = fs.readFileSync(
      path.join(keysDirRSA, 'public.der'),
    );

    res.status(200).json({
      success: true,
      ciphertext,
      signature: signatureBase64,
      publicKeySign: serverPublicKey.toString('base64'),
    });
  } catch (error) {
    console.error('Error en encryptedAndSign:', error);
    res.status(400).json({
      success: false,
      message: `No se pudo cifrar y firmar: ${error.message}`,
    });
  }
};

// ============================================================
// RSA  + VERIFY
// ============================================================
export const verify = (req, res) => {
  try {
    console.log('RSA + VERIFY');

    const { cardNumber, signature, publicKey } = req.body;

    // Validar que todos los datos necesarios estén presentes
    if (!cardNumber || !signature || !publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: cardNumber, signature, publicKey',
      });
    }

    // Convertir el número de tarjeta a buffer para verificar la firma
    const cardBuffer = Buffer.from(cardNumber, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'base64');
    const publicKeyBuffer = Buffer.from(publicKey, 'base64');

    // Verificar la firma con la clave pública del cliente
    const isValid = crypto.verify(
      'sha256',
      cardBuffer,
      {
        key: publicKeyBuffer,
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
        message:
          'Firma inválida - El número de tarjeta ha sido alterado o la firma no corresponde',
      });
    }

    // Si la firma es válida, devolver confirmación
    res.status(200).json({
      success: true,
      message: 'Firma verificada correctamente',
      data: {
        cardNumber,
        verified: true,
      },
    });
  } catch (error) {
    console.error('Error en signature:', error);
    res.status(400).json({
      success: false,
      message: `No se pudo verificar la firma: ${error.message}`,
    });
  }
};

// ============================================================
// RSA  + SIGNATURE
// ============================================================
export const signature = (req, res) => {
  try {
    console.log('RSA + SIGNATURE');

    const { cardNumber } = req.body;

    // Validar que el número de tarjeta esté presente
    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        message: 'Falta el número de tarjeta (cardNumber)',
      });
    }

    // Convertir el número de tarjeta a buffer
    const cardBuffer = Buffer.from(cardNumber, 'utf8');

    // Cargar la clave privada del servidor
    const keysDirRSA = path.join(process.cwd(), 'keys-rsa-der');
    const privateKey = fs.readFileSync(path.join(keysDirRSA, 'private.der'));

    // Firmar el número de tarjeta con la clave privada del servidor
    const signature = crypto.sign('sha256', cardBuffer, {
      key: privateKey,
      format: 'der',
      type: 'pkcs8',
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    });

    const signatureBase64 = signature.toString('base64');

    // Leer la clave pública del servidor para enviarla al cliente
    const serverPublicKey = fs.readFileSync(
      path.join(keysDirRSA, 'public.der'),
    );

    res.status(200).json({
      success: true,
      message: 'Firma generada correctamente',
      data: {
        cardNumber,
        signature: signatureBase64,
        publicKey: serverPublicKey.toString('base64'),
      },
    });
  } catch (error) {
    console.error('Error en signature:', error);
    res.status(400).json({
      success: false,
      message: `No se pudo generar la firma: ${error.message}`,
    });
  }
};
