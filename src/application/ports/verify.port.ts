import { VerifyConfigECAndRSA } from '../../domain/types/client.type';

export interface VerifyPort {
  /**
   * Verifies that `signature` is valid for the given `data` and `key`.
   * @param config - Object containing `algorithm`, `key`, `signature`, and `data`.
   * @returns A Promise that resolves to `true` if the signature is valid, otherwise `false`.
   */
  execute({
    algorithm,
    key,
    signature,
    data,
  }: VerifyConfigECAndRSA): Promise<boolean>;
}
