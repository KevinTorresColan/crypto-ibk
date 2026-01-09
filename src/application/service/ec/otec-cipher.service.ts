import {
  CipherSuite,
  CipherSuiteConfig,
  ECCurve,
} from '../../../domain/types/EC.types';
import { CIPHER_SUITE_CONFIGS } from '../../../domain/crypto/cipher-suite';
import { Mode } from '../../../domain/types/client.type';
import { arrayBufferToBase64 } from '../../../shared/utils/converter.util';
import { ECCipherContext } from '../../context/ec-cipher.context';

export class OTECCipherService {
  private state: 'INITIALIZED' | 'FINALIZED' = 'INITIALIZED';
  private aesKey!: CryptoKey;
  private config: CipherSuiteConfig;
  private mode: Mode;

  private constructor(
    private readonly localKeyPair: CryptoKeyPair,
    private readonly remotePublicKey: CryptoKey,
    cipherSuite: CipherSuite,
    mode: Mode,
    private readonly curve: ECCurve,
    private readonly deps: ECCipherContext,
  ) {
    this.config = CIPHER_SUITE_CONFIGS[cipherSuite];
    this.mode = mode;
  }

  static _create(params: {
    localKeyPair: CryptoKeyPair;
    remotePublicKey: CryptoKey;
    cipherSuite: CipherSuite;
    mode: Mode;
    curve: ECCurve;
    deps: ECCipherContext;
  }): OTECCipherService {
    return new OTECCipherService(
      params.localKeyPair,
      params.remotePublicKey,
      params.cipherSuite,
      params.mode,
      params.curve,
      params.deps,
    );
  }

  async doFinal(data: ArrayBuffer | string): Promise<ArrayBuffer> {
    if (this.state === 'FINALIZED') {
      throw new Error('This instance has already been used');
    }
    this.state = 'FINALIZED';

    const sharedSecret = await this.deriveSharedSecret();

    this.aesKey = await this.deriveAESKey(sharedSecret);

    if (this.mode === Mode.ENCRYPT) {
      return this.encryptInternal(data);
    } else {
      if (typeof data === 'string') {
        throw new Error('Decryption requires ArrayBuffer');
      }
      return this.decryptInternal(data);
    }
  }

  async getPublicKey(): Promise<string> {
    const spki = await this.deps._exportKeyUseCase.execute({
      format: 'spki',
      key: this.localKeyPair!.publicKey,
    });
    return arrayBufferToBase64(spki as ArrayBuffer);
  }

  getPublicKeyCrypto(): CryptoKey {
    return this.localKeyPair.publicKey;
  }

  private async deriveSharedSecret(): Promise<ArrayBuffer> {
    const sharedSecret = await this.deps._deriveBitsUseCase.execute({
      algorithm: { name: 'ECDH', public: this.remotePublicKey },
      baseKey: this.localKeyPair.privateKey,
      length: this.getCurveBitLength(),
    });
    return sharedSecret;
  }

  private async deriveAESKey(sharedSecret: ArrayBuffer): Promise<CryptoKey> {
    const hashed = await this.deps._digestUseCase.execute({
      algorithm: this.config.hashAlgorithm,
      data: sharedSecret,
    });
    const keyBytes = hashed.slice(0, this.config.keySizeBytes);

    return await this.deps._importKeyUseCase.execute(keyBytes, {
      format: 'raw',
      algorithm: {
        name: this.config.algorithm,
        length: this.config.keySizeBits,
      },
      isExtractable: false,
      keyUsages: [this.mode],
    });
  }

  private async encryptInternal(
    data: ArrayBuffer | string,
  ): Promise<ArrayBuffer> {
    const plaintext =
      typeof data === 'string'
        ? new TextEncoder().encode(data)
        : new Uint8Array(data);

    // Generate IV (matching AESGCMCipher
    const iv = this.deps._getRandomUseCase.execute(this.config.ivLengthBytes);

    // Encrypt with AES-GCM
    const ciphertext = await this.deps._encryptUseCase.execute({
      algorithm: {
        name: this.config.algorithm,
        iv,
        tagLength: this.config.tagLengthBits,
      },
      key: this.aesKey,
      data: plaintext,
    });

    // Return iv + ciphertext (matching Kotlin's format)
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(ciphertext), iv.length);
    return result.buffer;
  }

  private async decryptInternal(
    encryptedData: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    const iv = encryptedData.slice(0, this.config.ivLengthBytes);
    const ciphertext = encryptedData.slice(this.config.ivLengthBytes);

    const plaintext = await this.deps._decryptUseCase.execute({
      algorithm: {
        name: this.config.algorithm,
        iv,
        tagLength: this.config.tagLengthBits,
      },
      key: this.aesKey,
      data: ciphertext,
    });

    return plaintext;
  }

  private getCurveBitLength(): number {
    const curveBits = {
      [ECCurve.P256]: 256,
      [ECCurve.P384]: 384,
      [ECCurve.P521]: 521,
    };
    return curveBits[this.curve];
  }
}
