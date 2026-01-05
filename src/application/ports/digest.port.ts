import { DigestConfigECAndRSA } from '../../domain/types/client.type';

export interface DigestPort {
  /**
   * Computes a digest for the provided config.
   * @param config - Digest configuration (algorithm, key, data, etc.).
   * @returns A Promise that resolves to an `ArrayBuffer` containing the digest.
   */
  execute(config: DigestConfigECAndRSA): Promise<ArrayBuffer>;
}
