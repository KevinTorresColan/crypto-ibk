import {
  DeriveAESAlgorithm,
  ECAlgorithm,
  ECDHParams,
  ECKeyGenParams,
  EncryptAESAlgorithm,
} from './EC.types';
import { HMACAlgorithm, HMACGenerateKeyAlgorithm } from './hmac.types';
import { EncryptRSA, RSAAlgorithm, RSAKeyGenParams } from './rsa.types';

export type KeyFormatECAndRSA = 'spki' | 'pkcs8' | 'raw';

export type ImportKeyFormat = 'spki' | 'pkcs8' | 'raw' | 'jwk';

export type KeyUsagesECAndRSA =
  | KeyUsage[]
  | Array<KeyUsage>
  | Iterable<KeyUsage>;

export type ECAndRSAGenerateKeyAlgorithm =
  | RSAKeyGenParams
  | ECKeyGenParams
  | HMACGenerateKeyAlgorithm;

export type EncryptAlgorithm = EncryptRSA | EncryptAESAlgorithm;

export type ECAndRSAAlgorithm =
  | RSAAlgorithm
  | ECAlgorithm
  | DeriveAESAlgorithm
  | HMACAlgorithm;

export interface KeysType {
  privateKey: string | ArrayBuffer;
  publicKey: string | ArrayBuffer;
}

export interface DecryptConfig {
  algorithm:
    | AlgorithmIdentifier
    | RsaOaepParams
    | AesCtrParams
    | AesCbcParams
    | AesGcmParams;
  key: CryptoKey;
  data: ArrayBuffer | Uint8Array<ArrayBuffer> | Uint8Array<ArrayBufferLike>;
}

export interface DeriveBitsConfigECAndRSA {
  algorithm: ECDHParams;
  baseKey: CryptoKey;
  length: number;
}

export interface DeriveKeyConfigECAndRSA {
  algorithm: ECDHParams;
  baseKey: CryptoKey;
  algorithmDerive: DeriveAESAlgorithm;
  isExtractable: boolean;
  keyUsages: Iterable<'encrypt' | 'decrypt'>;
}

export interface DigestConfigECAndRSA {
  algorithm: AlgorithmIdentifier;
  data: ArrayBuffer | Uint8Array<ArrayBuffer>;
}

export interface EncryptConfig {
  algorithm: EncryptAlgorithm;
  key: CryptoKey;
  data: ArrayBuffer | Uint8Array<ArrayBuffer> | Uint8Array<ArrayBufferLike>;
}

export interface ExportKeyConfigECAndRSA {
  format: KeyFormatECAndRSA;
  key: CryptoKey;
}

export interface GenerateKeyConfigECAndRSA {
  algorithm: ECAndRSAGenerateKeyAlgorithm;
  isExtractable: boolean;
  keyUsages: KeyUsagesECAndRSA;
}

export interface ImportKeyConfigECAndRSA {
  algorithm: ECAndRSAAlgorithm;
  format: KeyFormatECAndRSA;
  isExtractable?: boolean;
  keyUsages: KeyUsagesECAndRSA;
}

export interface SignConfigECAndRSA {
  algorithm: RSAAlgorithm | ECAlgorithm | AlgorithmIdentifier;
  key: CryptoKey;
  data: ArrayBuffer;
}

export interface VerifyConfigECAndRSA {
  algorithm: AlgorithmIdentifier | ECAlgorithm | RSAAlgorithm;
  key: CryptoKey;
  signature: ArrayBuffer;
  data: ArrayBuffer;
}

/**
 * Cryptographic operation mode
 *
 * Specifies whether to perform encryption or decryption operations.
 *
 * @enum {string}
 * @property {string} ENCRYPT - Perform encryption operation (plaintext → ciphertext)
 * @property {string} DECRYPT - Perform decryption operation (ciphertext → plaintext)
 */
export enum Mode {
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt',
}

/**
 * Digital signature operation mode
 *
 * Specifies the type of signature operation to perform, if any.
 *
 * @enum {string}
 * @property {string} SIGN - Generate a digital signature for data
 * @property {string} VERIFY - Verify an existing digital signature
 */
export enum SignMode {
  SIGN = 'sign',
  VERIFY = 'verify',
}
