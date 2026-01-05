/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImportKeyFormat } from '../../../domain/types/client.type';
import { CryptoRepository } from '../../../domain/repository/crypto.repository';

export class WebCryptoAdapter implements CryptoRepository {
  private subtle: SubtleCrypto;
  private crypto: Crypto;

  constructor(subtle?: SubtleCrypto, cryptoObj?: Crypto) {
    this.crypto = cryptoObj ?? (globalThis as any).crypto;
    this.subtle = subtle ?? this.crypto?.subtle;

    if (
      !this.subtle ||
      !this.crypto ||
      typeof this.crypto.getRandomValues !== 'function'
    ) {
      throw new Error(
        'Web Crypto API (crypto.subtle / crypto.getRandomValues) no disponible en este entorno',
      );
    }
  }

  async importKey(
    format: ImportKeyFormat,
    keyData: ArrayBuffer,
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm,
    extractable = false,
    keyUsages: KeyUsage[] = [],
  ): Promise<CryptoKey> {
    return this.subtle.importKey(
      format as any,
      keyData,
      algorithm as any,
      extractable,
      keyUsages as any,
    );
  }

  async encrypt(
    algorithm: AlgorithmIdentifier | RsaOaepParams | AesGcmParams,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer> {
    return this.subtle.encrypt(algorithm as any, key, data as any);
  }

  async decrypt(
    algorithm:
      | AlgorithmIdentifier
      | RsaOaepParams
      | AesCtrParams
      | AesCbcParams
      | AesGcmParams,
    key: CryptoKey,
    data: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    return this.subtle.decrypt(algorithm as any, key, data as any);
  }

  async sign(
    algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer> {
    return this.subtle.sign(algorithm as any, key, data as any);
  }

  async verify(
    algorithm: AlgorithmIdentifier,
    key: CryptoKey,
    signature: ArrayBuffer,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<boolean> {
    return this.subtle.verify(algorithm as any, key, signature, data as any);
  }

  async generateKey(
    algorithm: RsaHashedKeyGenParams | EcKeyGenParams | AesKeyGenParams,
    extractable: boolean,
    usages: KeyUsage[],
  ): Promise<CryptoKeyPair | CryptoKey> {
    return this.subtle.generateKey(
      algorithm as any,
      extractable,
      usages as any,
    );
  }

  async deriveKey(
    algorithm: EcdhKeyDeriveParams | HkdfParams,
    baseKey: CryptoKey,
    derivedKeyType: EcKeyGenParams | AesKeyGenParams | HmacImportParams,
    extractable: boolean,
    keyUsages: KeyUsage[],
  ): Promise<CryptoKey> {
    return this.subtle.deriveKey(
      algorithm as any,
      baseKey,
      derivedKeyType as any,
      extractable,
      keyUsages as any,
    );
  }

  async deriveBits(
    algorithm: EcdhKeyDeriveParams | HkdfParams,
    baseKey: CryptoKey,
    length: number,
  ): Promise<ArrayBuffer> {
    return this.subtle.deriveBits(algorithm as any, baseKey, length);
  }

  async digest(
    algorithm: AlgorithmIdentifier,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer> {
    return this.subtle.digest(algorithm, data as any);
  }

  async exportKey(
    format: 'spki' | 'pkcs8' | 'raw',
    key: CryptoKey,
  ): Promise<ArrayBuffer | JsonWebKey> {
    return this.subtle.exportKey(format as any, key);
  }

  getRandomValues<T extends ArrayBufferView>(array: T): T {
    return this.crypto.getRandomValues(array as any) as T;
  }
}
