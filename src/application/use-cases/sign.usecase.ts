import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { SignPort } from '../ports/sign.port';
import { SignConfigECAndRSA } from '../../domain/types/client.type';

export class SignUseCase implements SignPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Signs provided data using the configured algorithm and key.
   * @param config - Object with `algorithm`, `key`, and `data` to sign.
   * @returns A Promise that resolves to an `ArrayBuffer` containing the signature.
   */
  async execute({
    algorithm,
    key,
    data,
  }: SignConfigECAndRSA): Promise<ArrayBuffer> {
    const signatureArrayBuffer = await this._cryptoRepository.sign(
      algorithm,
      key,
      data,
    );

    return signatureArrayBuffer;
  }
}
