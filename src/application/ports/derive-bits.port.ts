import { DeriveBitsConfigECAndRSA } from '../../domain/types/client.type';

export interface DeriveBitsPort {
  /**
   * Derives bits according to the provided config.
   * @param config - Derive bits configuration (algorithm, key, length, etc.).
   * @returns A Promise that resolves to an `ArrayBuffer` containing derived bits.
   */
  execute(config: DeriveBitsConfigECAndRSA): Promise<ArrayBuffer>;
}
