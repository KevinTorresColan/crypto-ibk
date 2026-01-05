import { DeriveKeyConfigECAndRSA } from '../../domain/types/client.type';

export interface DeriveKeyPort {
  /**
   * Derives a `CryptoKey` according to the provided config.
   * @param config - Derive key configuration (algorithm, length, usages, etc.).
   * @returns A Promise that resolves to a `CryptoKey`.
   */
  execute(config: DeriveKeyConfigECAndRSA): Promise<CryptoKey>;
}
