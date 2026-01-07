import { Mode } from '../../domain/types/client.type';
import { CipherSuite, ECCurve } from '../../domain/types/EC.types';
import { arrayBufferToBase64 } from '../../shared/utils/converter.util';
import { ECCipherContext } from '../context/ec-cipher.context';
import { OTECCipherUseCase } from '../service/ec/otec-cipher.service';
import { transformKeyFormat } from '../utils/key-format.util';

export class OTECCipherBuilder {
  private used: boolean = false;
  private curve: ECCurve = ECCurve.P256;
  private cipherSuite: CipherSuite = CipherSuite.AES_256_GCM_SHA256;
  private mode: Mode = Mode.DECRYPT;
  private remotePublicKey: CryptoKey | null = null;
  private localKeyPair: CryptoKeyPair | null = null;

  constructor(private readonly deps: ECCipherContext) {}

  withCurve(curve: ECCurve): this {
    this.curve = curve;
    this.localKeyPair = null;
    return this;
  }

  withCipherSuite(cipherSuite: CipherSuite): this {
    this.cipherSuite = cipherSuite;
    return this;
  }

  withMode(mode: Mode): this {
    this.mode = mode;
    return this;
  }

  async withRemotePublicKey(remoteKey: string | CryptoKey): Promise<this> {
    if (remoteKey instanceof CryptoKey) {
      this.remotePublicKey = remoteKey;
    } else {
      const keyBuffer = transformKeyFormat(remoteKey);
      this.remotePublicKey = await this.deps._importKeyUseCase.execute(
        keyBuffer,
        {
          format: 'spki',
          algorithm: { name: 'ECDH', namedCurve: this.curve },
          isExtractable: false,
          keyUsages: [],
        },
      );
    }
    return this;
  }

  async getPublicKey(): Promise<string> {
    await this.ensureKeyPair();
    const spki = await this.deps._exportKeyUseCase.execute({
      format: 'spki',
      key: this.localKeyPair!.publicKey,
    });
    return arrayBufferToBase64(spki as ArrayBuffer);
  }

  async build(): Promise<OTECCipherUseCase> {
    if (this.used) throw new Error('Builder already used');
    if (!this.remotePublicKey) throw new Error('Remote public key not set');

    await this.ensureKeyPair();
    this.used = true;

    return OTECCipherUseCase._create({
      localKeyPair: this.localKeyPair!,
      remotePublicKey: this.remotePublicKey,
      cipherSuite: this.cipherSuite,
      mode: this.mode,
      curve: this.curve,
      deps: this.deps,
    });
  }

  private async ensureKeyPair(): Promise<void> {
    this.localKeyPair ??= (await this.deps._generateKeyPairUseCase.execute({
      algorithm: { name: 'ECDH', namedCurve: this.curve },
      isExtractable: true,
      keyUsages: ['deriveBits'],
    })) as CryptoKeyPair;
  }
}
