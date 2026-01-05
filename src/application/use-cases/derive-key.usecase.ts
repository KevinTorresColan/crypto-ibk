import { DeriveKeyConfigECAndRSA } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { DeriveKeyPort } from '../ports/derive-key.port';

export class DeriveKeyUseCase implements DeriveKeyPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Derives a key using the repository.
   * @param config - Config including `algorithm`, `baseKey`, `algorithmDerive`, and key options.
   * @returns A Promise resolving to a derived `CryptoKey`.
   */
  async execute({
    algorithm,
    baseKey,
    algorithmDerive,
    isExtractable,
    keyUsages,
  }: DeriveKeyConfigECAndRSA): Promise<CryptoKey> {
    const publicKey = await this._cryptoRepository.deriveKey(
      algorithm,
      baseKey,
      algorithmDerive,
      isExtractable,
      Array.from(keyUsages),
    );

    return publicKey;
  }
}
