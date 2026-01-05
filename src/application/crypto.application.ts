import { KeyStoreRepository } from '../domain/repository/key-store.repository';
import { KeysType } from '../domain/types/client.type';
import { CryptoPort } from './ports/crypto.port';
import { OTECCipherFactory } from './builders/otec-cipher.factory';
import { ECCipherFactory } from './builders/ec-cipher.factory';
import { RSAFactory } from './builders/rsa.factory';

export class CryptoApplication implements CryptoPort {
  constructor(
    private readonly _OTEC: OTECCipherFactory,
    private readonly _EC: ECCipherFactory,
    private readonly _RSA: RSAFactory,
    private readonly _keyStore: KeyStoreRepository,
  ) {}

  RSA(): RSAFactory {
    return this._RSA;
  }

  OTEC(): OTECCipherFactory {
    return this._OTEC;
  }

  EC(): ECCipherFactory {
    return this._EC;
  }

  GetKey(name: string): KeysType | undefined {
    return this._keyStore.get(name);
  }
}
