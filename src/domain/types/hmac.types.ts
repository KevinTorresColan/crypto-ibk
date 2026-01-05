export enum HMACHash {
  SHA_256 = 'SHA-256',
  SHA_384 = 'SHA-384',
  SHA_512 = 'SHA-512',
}

export enum HMACMode {
  ENABLE = 'enable',
}

export type HMacLength = 256 | 384 | 512;

export interface HMACAlgorithm {
  name: 'HMAC';
  hash: 'SHA-256' | 'SHA-384' | 'SHA-512';
}

export interface HMACGenerateKeyAlgorithm extends HMACAlgorithm {
  length?: HMacLength;
}

export type ImportHMACKeyParams = {
  format: 'raw';
  keyData: ArrayBuffer | Uint8Array;
  algorithm: HMACAlgorithm;
  extractable?: boolean;
  keyUsages: readonly ('sign' | 'verify')[];
};
