import { EncryptConfig } from '../../domain/types/client.type';

export interface EncryptPort {
  /**
   * Encrypts the input data.
   * @param config - Encryption configuration (algorithm, key, plaintext, etc.).
   * @returns A Promise that resolves to an `ArrayBuffer` with the ciphertext.
   */
  execute(config: EncryptConfig): Promise<ArrayBuffer>;
}
