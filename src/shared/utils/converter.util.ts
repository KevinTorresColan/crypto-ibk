/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Encodes a JSON object into a `Uint8Array` of bytes.
 *
 * @param data - Object to encode as JSON.
 * @returns A `Uint8Array` containing the binary representation of the JSON.
 */
export function EncodeJsonToUint8Array(data: any): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(JSON.stringify(data));
}

/**
 * Converts an `ArrayBuffer` to a Base64 string.
 * Useful for transporting binary data over text-only channels.
 *
 * @param buffer - ArrayBuffer to convert.
 * @returns Base64-encoded string.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string to an `ArrayBuffer`.
 *
 * @param b64 - Base64 string.
 * @returns Decoded `ArrayBuffer`.
 */
export function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Converts an `ArrayBuffer` to Base64 and removes line breaks.
 * Useful for generating compact Base64 output.
 *
 * @param buffer - ArrayBuffer to convert.
 * @returns Base64 string without line breaks.
 */
export function arrayBufferToBase64Clean(buffer: ArrayBuffer): string {
  return arrayBufferToBase64(buffer).replace(/\n/g, '');
}
