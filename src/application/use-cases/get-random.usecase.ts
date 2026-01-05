import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { GetRandomPort } from '../ports/get-random.port';

export class GetRandomUseCase implements GetRandomPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Returns a Uint8Array filled with cryptographically secure random values.
   * @param length - Number of bytes to generate.
   * @returns A `Uint8Array` with `length` random bytes.
   */
  execute(length: number): Uint8Array<ArrayBuffer> {
    if (length <= 0) return new Uint8Array(0);
    const arr = new Uint8Array(length);
    this._cryptoRepository.getRandomValues(arr);
    return arr;
  }
}

export default GetRandomUseCase;
