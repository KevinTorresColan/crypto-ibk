import { EncryptConfig } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { EncryptPort } from '../ports/encrypt.port';

export class EncryptUseCase implements EncryptPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Encrypts the provided data.
   * @param config - Encryption configuration (algorithm, key, data).
   * @returns A Promise resolving to an `ArrayBuffer` containing ciphertext.
   */
  async execute({ algorithm, key, data }: EncryptConfig): Promise<ArrayBuffer> {
    const encrypted = await this._cryptoRepository.encrypt(
      algorithm,
      key,
      data,
    );

    return encrypted;
  }
}
