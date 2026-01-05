import { ExportKeyConfigECAndRSA } from '../../domain/types/client.type';
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { ExportKeysPort } from '../ports/export-keys.port';

export class ExportKeysUseCase implements ExportKeysPort {
  _cryptoRepository: CryptoRepository;

  constructor(cryptoRepository: CryptoRepository) {
    this._cryptoRepository = cryptoRepository;
  }

  /**
   * Exports the provided key in the requested format.
   * @param config - Object with `format` and `key` to export.
   * @returns A Promise resolving to `ArrayBuffer` or `string` depending on format.
   */
  async execute({
    format,
    key,
  }: ExportKeyConfigECAndRSA): Promise<ArrayBuffer | string> {
    const keyGenerate = await this._cryptoRepository.exportKey(format, key);
    return keyGenerate as ArrayBuffer | string;
  }
}
