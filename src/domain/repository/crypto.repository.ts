import { ImportKeyFormat } from '../types/client.type';

export interface CryptoRepository {
  importKey(
    format: ImportKeyFormat,
    keyData: ArrayBuffer | Uint8Array<ArrayBuffer>,
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm,
    extractable: boolean,
    keyUsages: KeyUsage[],
  ): Promise<CryptoKey>;

  encrypt(
    algorithm: AlgorithmIdentifier | RsaOaepParams | AesGcmParams,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer>;

  decrypt(
    algorithm:
      | AlgorithmIdentifier
      | RsaOaepParams
      | AesCtrParams
      | AesCbcParams
      | AesGcmParams,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer>;

  sign(
    algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer>;

  verify(
    algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
    key: CryptoKey,
    signature: ArrayBuffer,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<boolean>;

  generateKey(
    algorithm: unknown,
    extractable: boolean,
    usages: KeyUsage[],
  ): Promise<CryptoKeyPair | CryptoKey>;

  deriveKey(
    algorithm: EcdhKeyDeriveParams | HkdfParams,
    baseKey: CryptoKey,
    derivedKeyType: EcKeyGenParams | AesKeyGenParams | HmacImportParams,
    extractable: boolean,
    keyUsages: KeyUsage[],
  ): Promise<CryptoKey>;

  deriveBits(
    algorithm: EcdhKeyDeriveParams | HkdfParams,
    baseKey: CryptoKey,
    length: number,
  ): Promise<ArrayBuffer>;

  digest(
    algorithm: AlgorithmIdentifier,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer>;

  getRandomValues(array: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer>;

  exportKey(
    format: 'spki' | 'pkcs8' | 'raw',
    key: CryptoKey,
  ): Promise<ArrayBuffer | JsonWebKey>;
}
