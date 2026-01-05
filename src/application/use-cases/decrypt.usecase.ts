import { DecryptConfig } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { DecryptPort } from '../ports/decrypt.port';

export class DecryptUseCase implements DecryptPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Decrypts data using the provided configuration.
   * @param config - DecryptConfig containing `algorithm`, `key` and `data`.
   * @returns A Promise resolving to an `ArrayBuffer` with the plaintext.
   */
  async execute({ algorithm, key, data }: DecryptConfig): Promise<ArrayBuffer> {
    const decrypted = await this._cryptoRepository.decrypt(
      algorithm,
      key,
      data,
    );

    return decrypted;
  }
}
