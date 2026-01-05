import { ImportKeyConfigECAndRSA } from '../../domain/types/client.type';

export interface ImportKeyPort {
  /**
   * Imports a key from raw bytes or ArrayBuffer.
   * @param key - Raw key material as `ArrayBuffer` or `Uint8Array`.
   * @param config - Import configuration (format, algorithm, usages, extractable, etc.).
   * @returns A Promise that resolves to the imported `CryptoKey`.
   */
  execute(
    key: ArrayBuffer | Uint8Array<ArrayBuffer>,
    config: ImportKeyConfigECAndRSA,
  ): Promise<CryptoKey>;
}
