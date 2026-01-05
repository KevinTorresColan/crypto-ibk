import {
  CipherSuite,
  CipherSuiteConfig,
  ECCurve,
  ECDSAHashAlgorithm,
} from '../../../domain/types/EC.types';
import { arrayBufferToBase64 } from '../../../shared/utils/converter.util';
import { CIPHER_SUITE_CONFIGS } from '../../../domain/crypto/cipher-suite';
import { ECDSA_HASH_BY_CURVE } from '../../../domain/crypto/ecdsa';
import { Mode } from '../../../domain/types/client.type';
import { ECCipherContext } from '../../context/ec-cipher.context';

export class ECCipherService {
  private aesKey!: CryptoKey;
  private config: CipherSuiteConfig;
  private hash: ECDSAHashAlgorithm;
  private mode: Mode;

  private constructor(
    private readonly localKeyPair: CryptoKeyPair,
    private readonly localSignatureKeyPair: CryptoKeyPair,
    private readonly remotePublicKey: CryptoKey,
    private readonly remoteSignaturePublicKey: CryptoKey,
    cipherSuite: CipherSuite,
    mode: Mode | null,
    private readonly curve: ECCurve,
    private readonly hmacKey: CryptoKey | null,
    private readonly deps: ECCipherContext,
  ) {
    this.config = CIPHER_SUITE_CONFIGS[cipherSuite];
    this.hash = ECDSA_HASH_BY_CURVE[this.curve] as ECDSAHashAlgorithm;
    this.mode = mode || Mode.DECRYPT;
  }

  static _create(params: {
    localKeyPair: CryptoKeyPair;
    localSignatureKeyPair: CryptoKeyPair;
    remotePublicKey: CryptoKey;
    remoteSignaturePublicKey: CryptoKey;
    cipherSuite: CipherSuite;
    mode: Mode;
    curve: ECCurve;
    hmacKey: CryptoKey | null;
    deps: ECCipherContext;
  }): ECCipherService {
    return new ECCipherService(
      params.localKeyPair,
      params.localSignatureKeyPair,
      params.remotePublicKey,
      params.remoteSignaturePublicKey,
      params.cipherSuite,
      params.mode,
      params.curve,
      params.hmacKey,
      params.deps,
    );
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

  async getSignaturePublicKey(): Promise<string> {
    const spki = await this.deps._exportKeyUseCase.execute({
      format: 'spki',
      key: this.localSignatureKeyPair!.publicKey,
    });
    return arrayBufferToBase64(spki as ArrayBuffer);
  }

  getSignaturePublicKeyCrypto(): CryptoKey {
    return this.localSignatureKeyPair.publicKey;
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

  private async symmetricalKey(): Promise<void> {
    const sharedSecret = await this.deriveSharedSecret();
    this.aesKey = await this.deriveAESKey(sharedSecret);
  }

  async encrypt(data: ArrayBuffer | string): Promise<ArrayBuffer> {
    await this.symmetricalKey();

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

  async decrypt(encryptedData: ArrayBuffer): Promise<ArrayBuffer> {
    await this.symmetricalKey();

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

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (this.localSignatureKeyPair === null)
      throw new Error('Signature key pair not available');

    const signature = await this.deps._signUseCase.execute({
      algorithm: { name: 'ECDSA', hash: this.hash },
      key: this.localSignatureKeyPair!.privateKey,
      data,
    });

    return signature;
  }

  async verify(data: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    if (this.remoteSignaturePublicKey === null)
      throw new Error('Remote signature public key not available');

    const isValid = await this.deps._verifyUseCase.execute({
      algorithm: { name: 'ECDSA', hash: this.hash },
      key: this.remoteSignaturePublicKey,
      signature,
      data,
    });

    if (!isValid) throw new Error('Signature verification failed');

    return isValid;
  }

  async hmacSign(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (this.hmacKey === null) throw new Error('HMAC key not available');

    const signature = await this.deps._signUseCase.execute({
      algorithm: { name: 'HMAC' },
      key: this.hmacKey,
      data,
    });

    return signature;
  }

  async hmacVerify(
    data: ArrayBuffer,
    signature: ArrayBuffer,
  ): Promise<boolean> {
    if (this.hmacKey === null) throw new Error('HMAC key not available');

    const isValid = await this.deps._verifyUseCase.execute({
      algorithm: { name: 'HMAC' },
      key: this.hmacKey,
      signature,
      data,
    });

    if (!isValid) throw new Error('HMAC verification failed');

    return isValid;
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
