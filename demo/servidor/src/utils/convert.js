export const b64ToArrayBuffer = (b64) =>
  Uint8Array.from(Buffer.from(b64, 'base64')).buffer;
