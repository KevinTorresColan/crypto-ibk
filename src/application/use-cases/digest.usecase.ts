import { DigestConfigECAndRSA } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { DigestPort } from '../ports/digest.port';

export class DigestUseCase implements DigestPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Computes a digest for the provided data and algorithm.
   * @param config - Object containing `algorithm` and `data`.
   * @returns A Promise resolving to an `ArrayBuffer` with the digest.
   */
  async execute({
    algorithm,
    data,
  }: DigestConfigECAndRSA): Promise<ArrayBuffer> {
    const hash = await this._cryptoRepository.digest(algorithm, data);

    return hash;
  }
}
