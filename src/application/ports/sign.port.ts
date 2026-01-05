import { SignConfigECAndRSA } from '../../domain/types/client.type';

export interface SignPort {
  /**
   * Produces a signature over `data` using the provided `key` and `algorithm`.
   * @param config - Object containing `algorithm`, `key`, and `data` to sign.
   * @returns A Promise that resolves to an `ArrayBuffer` with the signature.
   */
  execute({ algorithm, key, data }: SignConfigECAndRSA): Promise<ArrayBuffer>;
}
