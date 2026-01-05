import { KeysType } from '../../../domain/types/client.type';
import { ECCipherFactory } from '../../../application/builders/ec-cipher.factory';
import { OTECCipherFactory } from '../../../application/builders/otec-cipher.factory';
import { RSAFactory } from '../../../application/builders/rsa.factory';
import { CryptoPort } from '../../../application/ports/crypto.port';

export class CryptoAdapter {
  constructor(private readonly _client: CryptoPort) {}

  RSA(): RSAFactory {
    return this._client.RSA();
  }

  OTEC(): OTECCipherFactory {
    return this._client.OTEC();
  }

  EC(): ECCipherFactory {
    return this._client.EC();
  }

  GetKey(name: string): KeysType | undefined {
    return this._client.GetKey(name);
  }
}
