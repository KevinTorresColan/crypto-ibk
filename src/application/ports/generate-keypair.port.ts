import { GenerateKeyConfigECAndRSA } from '../../domain/types/client.type';

export interface GenerateKeyPairPort {
  /**
   * Generates a key pair or key according to the provided configuration.
   * @param config - Key generation configuration (algorithm, extractable, usages, etc.).
   * @returns A Promise that resolves to a `CryptoKeyPair` or a single `CryptoKey`.
   */
  execute(
    config: GenerateKeyConfigECAndRSA,
  ): Promise<CryptoKeyPair | CryptoKey>;
}
