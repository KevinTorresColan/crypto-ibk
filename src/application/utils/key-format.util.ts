import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from '../../shared/utils/converter.util';

export function isPEM(key: string): boolean {
  return key.includes('-----BEGIN');
}

export function isDERBase64(key: string): boolean {
  return /^[A-Za-z0-9+/=]+$/.test(key) && !key.includes('BEGIN');
}

/**
 * Convert PEM-formatted string to an ArrayBuffer (extracts and decodes the Base64 payload).
 */
export function pemToArrayBuffer(pem: string): ArrayBuffer {
  const matches = pem.match(
    /-----BEGIN [\w\s]+-----([\s\S]+?)-----END [\w\s]+-----/,
  );
  const b64 = matches
    ? matches[1].replace(/\s+/g, '')
    : pem.replace(/\s+/g, '');
  return base64ToArrayBuffer(b64);
}

/**
 * Convert an ArrayBuffer (SPKI/PKCS8/raw) to PEM format with the given header.
 */
export function arrayBufferToPem(buffer: ArrayBuffer, header: string): string {
  const b64 = arrayBufferToBase64(buffer);
  const chunked = b64.match(/.{1,64}/g)?.join('\n') || b64;
  return `-----BEGIN ${header}-----\n${chunked}\n-----END ${header}-----`;
}

/**
 * Convert DER (Base64) string to ArrayBuffer.
 */
export function derToBinary(derBase64: string): ArrayBuffer {
  const binary = atob(derBase64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function transformKeyFormat(key: string) {
  if (isPEM(key)) return pemToArrayBuffer(key);
  if (isDERBase64(key)) return derToBinary(key);

  throw new Error('Unknown key format. Expected PEM or DER Base64.');
}
