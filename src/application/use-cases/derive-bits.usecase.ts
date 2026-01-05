import { DeriveBitsConfigECAndRSA } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { DeriveBitsPort } from '../ports/derive-bits.port';

export class DeriveBitsUseCase implements DeriveBitsPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Derives bits based on the provided config.
   * @param config - Contains `algorithm`, `baseKey`, and `length`.
   * @returns A Promise resolving to an `ArrayBuffer` with derived bits.
   */
  async execute({
    algorithm,
    baseKey,
    length,
  }: DeriveBitsConfigECAndRSA): Promise<ArrayBuffer> {
    const bits = await this._cryptoRepository.deriveBits(
      algorithm,
      baseKey,
      length,
    );

    return bits;
  }
}
