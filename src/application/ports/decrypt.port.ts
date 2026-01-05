import { DecryptConfig } from '../../domain/types/client.type';

export interface DecryptPort {
  /**
   * Decrypts the given data.
   * @param config - Decryption configuration (algorithm, key, ciphertext, etc.).
   * @returns A Promise that resolves to an `ArrayBuffer` with the plaintext.
   */
  execute(config: DecryptConfig): Promise<ArrayBuffer>;
}
