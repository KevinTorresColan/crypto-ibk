import { ExportKeyConfigECAndRSA } from '../../domain/types/client.type';

export interface ExportKeysPort {
  /**
   * Exports the key material.
   * @param config - Export configuration (format, key, encoding, etc.).
   * @returns A Promise that resolves to an `ArrayBuffer` or string depending on format.
   */
  execute(config: ExportKeyConfigECAndRSA): Promise<ArrayBuffer | string>;
}
