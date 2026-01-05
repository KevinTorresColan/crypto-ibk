import { KeysType } from '../../domain/types/client.type';
import { ECCipherFactory } from '../builders/ec-cipher.factory';
import { OTECCipherFactory } from '../builders/otec-cipher.factory';
import { RSAFactory } from '../builders/rsa.factory';

export interface CryptoPort {
  /**
   * Returns an `RSAFactory` for RSA encryption and decryption operations.
   * @returns An instance of `RSAFactory`.
   */
  RSA(): RSAFactory;
  // RSA(options: RSAEncryptOptions): Promise<string | EncryptRSACompleteResponse>;

  /**
   * Returns an `OTECCipherFactory` for one-time EC cipher operations.
   * @returns An instance of `OTECCipherFactory`.
   */
  OTEC(): OTECCipherFactory;

  /**
   * Returns an `ECCipherFactory` for EC cipher operations.
   * @returns An instance of `ECCipherFactory`.
   */
  EC(): ECCipherFactory;

  /**
   * Retrieves a named key from the key repository.
   * @param name - The key identifier.
   * @returns The key as `KeysType` or `undefined` if not found.
   */
  GetKey(name: string): KeysType | undefined;
}
