import { generateKeyPairSync } from 'crypto';
import fs from 'fs';
import path from 'path';
import { HMAC_SECRET_KEY } from '../../key-hmac/key.js';

const keysDirRSAPEM = path.join(process.cwd(), 'keys-rsa-pem');
const keysDirRSADER = path.join(process.cwd(), 'keys-rsa-der');

const keysDirECPEM = path.join(process.cwd(), 'keys-ec-pem');
const keysDirECDER = path.join(process.cwd(), 'keys-ec-der');

// Función para inicializar las claves

// ============================================================
// RSA Initialization Keys
// ============================================================
export const initializeKeysRSA = () => {
  // Generar claves si no existen
  if (!fs.existsSync(keysDirRSAPEM)) {
    fs.mkdirSync(keysDirRSAPEM);

    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    fs.writeFileSync(path.join(keysDirRSAPEM, 'public.pem'), publicKey);
    fs.writeFileSync(path.join(keysDirRSAPEM, 'private.pem'), privateKey);
    console.log('✅ Claves RSA - PEM, generadas exitosamente');
  } else {
    console.log('✅ Claves RSA - PEM ya existen');
  }
};

export const initializeKeysRSADER = () => {
  // Generar claves si no existen
  if (!fs.existsSync(keysDirRSADER)) {
    fs.mkdirSync(keysDirRSADER);

    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });

    fs.writeFileSync(path.join(keysDirRSADER, 'public.der'), publicKey);
    fs.writeFileSync(path.join(keysDirRSADER, 'private.der'), privateKey);
    console.log('✅ Claves RSA - DER, generadas exitosamente');
  } else {
    console.log('✅ Claves RSA - DER ya existen');
  }
};

// ============================================================
// RSA + get Public Key
// ============================================================
export const getPublicKeyRSA = (_req, res) => {
  const derPath = path.join(keysDirRSADER, 'public.der');

  if (derPath) {
    console.log('Leyendo clave pública RSA');
    const publicKey = fs.readFileSync(derPath);
    res.send(publicKey.toString('base64'));
  } else {
    res.status(404).send('No se encontró clave pública RSA');
  }
};

// ============================================================
// EC Initialization Keys
// ============================================================
export const initializeKeysEC = () => {
  if (!fs.existsSync(keysDirECPEM)) {
    fs.mkdirSync(keysDirECPEM);

    // Genera par EC P-256 (ECDH/ECDSA compatible)
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1', // P-256
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    fs.writeFileSync(path.join(keysDirECPEM, 'ec_public.pem'), publicKey);
    fs.writeFileSync(path.join(keysDirECPEM, 'ec_private.pem'), privateKey);
    console.log('✅ Claves EC - PEM, generadas exitosamente');
  } else {
    console.log('✅ Claves EC - PEM ya existen');
  }
};

export const initializeKeysECDER = () => {
  if (!fs.existsSync(keysDirECDER)) {
    fs.mkdirSync(keysDirECDER);

    // Genera par EC P-256 (ECDH/ECDSA compatible)
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1', // P-256
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });

    fs.writeFileSync(path.join(keysDirECDER, 'ec_public.der'), publicKey);
    fs.writeFileSync(path.join(keysDirECDER, 'ec_private.der'), privateKey);
    console.log('✅ Claves EC - DER, generadas exitosamente');
  } else {
    console.log('✅ Claves EC - DER ya existen');
  }
};

// ============================================================
// EC + get Public Key PEM
// ============================================================
export const getPublicKeyEC = (_req, res) => {
  const pemPath = path.join(keysDirECPEM, 'ec_public.pem');

  if (pemPath) {
    console.log('Leyendo clave pública EC + PEM');
    const publicKey = fs.readFileSync(pemPath, 'utf8');
    res.send(publicKey);
  } else {
    res.status(404).send('No se encontró clave pública EC + PEM');
  }
};

// ============================================================
// EC + get Public Key DER
// ============================================================
export const getPublicKeyECDER = (_req, res) => {
  const derPath = path.join(keysDirECDER, 'ec_public.der');

  if (derPath) {
    console.log('Leyendo clave pública EC + DER');
    const publicKey = fs.readFileSync(derPath);
    res.send(publicKey.toString('base64'));
  } else {
    res.status(404).send('No se encontró clave pública EC + DER');
  }
};

// ============================================================
// HMAC + get Secret Key
// ============================================================
export const getHMACSecretKey = (_req, res) => {
  res.send(HMAC_SECRET_KEY);
};
