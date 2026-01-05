import { GenerateKeyConfigECAndRSA } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { GenerateKeyPairPort } from '../ports/generate-keypair.port';

export class GenerateKeyPairUseCase implements GenerateKeyPairPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Generates a key pair or single key according to config.
   * @param config - Key generation settings (algorithm, extractable, usages).
   * @returns A Promise resolving to `CryptoKeyPair` or a single `CryptoKey`.
   */
  async execute({
    algorithm,
    isExtractable,
    keyUsages,
  }: GenerateKeyConfigECAndRSA): Promise<CryptoKeyPair | CryptoKey> {
    const keyPair = await this._cryptoRepository.generateKey(
      algorithm,
      isExtractable,
      Array.from(keyUsages),
    );

    return keyPair as CryptoKeyPair | CryptoKey;
  }
}
