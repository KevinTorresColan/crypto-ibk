import { RSAContext } from '../../context/rsa.context';

export class RSAService {
  private constructor(
    private readonly localKeyPair: CryptoKeyPair,
    private readonly remotePublicKey: CryptoKey | null,
    private readonly localSignatureKeyPair: CryptoKeyPair | null,
    private readonly remoteSignaturePublicKey: CryptoKey | null,
    private readonly deps: RSAContext,
  ) {}

  static _create(params: {
    localKeyPair: CryptoKeyPair;
    remotePublicKey: CryptoKey | null;
    localSignatureKeyPair: CryptoKeyPair | null;
    remoteSignaturePublicKey: CryptoKey | null;
    deps: RSAContext;
  }): RSAService {
    return new RSAService(
      params.localKeyPair,
      params.remotePublicKey,
      params.localSignatureKeyPair,
      params.remoteSignaturePublicKey,
      params.deps,
    );
  }

  async encrypt(data: ArrayBuffer | string): Promise<ArrayBuffer> {
    if (this.remotePublicKey === null && this.localKeyPair === null)
      throw new Error('No public key available for encryption');

    const plaintext =
      typeof data === 'string'
        ? new TextEncoder().encode(data)
        : new Uint8Array(data);

    const encrypted = await this.deps._encryptUseCase.execute({
      algorithm: { name: 'RSA-OAEP' },
      key: this.remotePublicKey ?? this.localKeyPair.publicKey,
      data: plaintext,
    });

    return encrypted;
  }

  async decrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    const decrypted = await this.deps._decryptUseCase.execute({
      algorithm: { name: 'RSA-OAEP' },
      key: this.localKeyPair.privateKey,
      data,
    });

    return decrypted;
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (this.localSignatureKeyPair === null)
      throw new Error('Signature key pair not available');

    const signature = await this.deps._signUseCase.execute({
      algorithm: { name: 'RSA-PSS', saltLength: 32 } as RsaPssParams,
      key: this.localSignatureKeyPair!.privateKey,
      data,
    });

    return signature;
  }

  async verify(data: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    const isValid = await this.deps._verifyUseCase.execute({
      algorithm: { name: 'RSA-PSS', saltLength: 32 } as RsaPssParams,
      key: this.remoteSignaturePublicKey!,
      data,
      signature,
    });

    return isValid;
  }
}
