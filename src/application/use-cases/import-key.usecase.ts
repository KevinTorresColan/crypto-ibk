import { ImportKeyConfigECAndRSA } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { ImportKeyPort } from '../ports/import-key.port';

export class ImportKeyUseCase implements ImportKeyPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Imports a key from raw bytes based on the provided config.
   * @param key - Raw key material as `ArrayBuffer` or `Uint8Array`.
   * @param config - Import configuration (format, algorithm, extractable, usages).
   * @returns A Promise resolving to the imported `CryptoKey`.
   */
  async execute(
    key: ArrayBuffer | Uint8Array<ArrayBuffer>,
    config: ImportKeyConfigECAndRSA,
  ): Promise<CryptoKey> {
    const publicKey = await this._cryptoRepository.importKey(
      config.format,
      key,
      { ...config.algorithm },
      config.isExtractable || false,
      Array.from(config.keyUsages),
    );

    return publicKey;
  }
}
