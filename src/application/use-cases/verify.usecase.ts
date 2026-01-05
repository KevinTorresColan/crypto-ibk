import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { VerifyConfigECAndRSA } from '../../domain/types/client.type';
import { VerifyPort } from '../ports/verify.port';

export class VerifyUseCase implements VerifyPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Verifies a signature for the given data and key.
   * @param config - Object containing `algorithm`, `key`, `signature`, and `data`.
   * @returns A Promise resolving to `true` if valid, otherwise `false`.
   */
  async execute({
    algorithm,
    key,
    signature,
    data,
  }: VerifyConfigECAndRSA): Promise<boolean> {
    const verifyArrayBuffer = await this._cryptoRepository.verify(
      algorithm,
      key,
      signature,
      data,
    );

    return verifyArrayBuffer;
  }
}
