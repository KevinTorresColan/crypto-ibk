import { Mode, SignMode } from '../../domain/types/client.type';
import { arrayBufferToBase64 } from '../../shared/utils/converter.util';
import { RSAContext } from '../context/rsa.context';
import { RSAService } from '../service/rsa/rsa.service';
import { transformKeyFormat } from '../utils/key-format.util';

export class RSABuilder {
  private mode: Mode | null = null;
  private signMode: SignMode | null = null;
  private localKeyPair: CryptoKeyPair | null = null;
  private remotePublicKey: CryptoKey | null = null;
  private localSignatureKeyPair: CryptoKeyPair | null = null;
  private remoteSignaturePublicKey: CryptoKey | null = null;

  constructor(private readonly deps: RSAContext) {}

  withMode(mode: Mode): this {
    this.mode = mode;
    return this;
  }

  withSignMode(signMode: SignMode): this {
    this.signMode = signMode;
    return this;
  }

  // ======================================================
  // ==================== Remote Keys  ====================
  // ======================================================

  async withRemotePublicKey(remoteKey: string | CryptoKey): Promise<this> {
    if (remoteKey instanceof CryptoKey) {
      this.remotePublicKey = remoteKey;
    } else {
      const keyBuffer = transformKeyFormat(remoteKey);
      this.remotePublicKey = await this.deps._importKeyUseCase.execute(
        keyBuffer,
        {
          format: 'spki',
          algorithm: { name: 'RSA-OAEP', hash: 'SHA-256' },
          isExtractable: false,
          keyUsages: [this.mode!],
        },
      );
    }
    return this;
  }

  async withRemoteSignaturePublicKey(
    remoteKey: string | CryptoKey,
  ): Promise<this> {
    if (remoteKey instanceof CryptoKey) {
      this.remoteSignaturePublicKey = remoteKey;
    } else {
      const keyBuffer = transformKeyFormat(remoteKey);
      this.remoteSignaturePublicKey = await this.deps._importKeyUseCase.execute(
        keyBuffer,
        {
          format: 'spki',
          algorithm: { name: 'RSA-PSS', hash: 'SHA-256' },
          isExtractable: false,
          keyUsages: [SignMode.VERIFY],
        },
      );
    }
    return this;
  }

  // ======================================================
  // ==================== Get Local Keys ==================
  // ======================================================

  async getPublicKey(): Promise<string> {
    await this.generateKeyPair();
    const spki = await this.deps._exportKeyUseCase.execute({
      format: 'spki',
      key: this.localKeyPair!.publicKey,
    });
    return arrayBufferToBase64(spki as ArrayBuffer);
  }

  async getSignaturePublicKey(): Promise<string> {
    await this.signatureKeyPair();
    const spki = await this.deps._exportKeyUseCase.execute({
      format: 'spki',
      key: this.localSignatureKeyPair!.publicKey,
    });
    return arrayBufferToBase64(spki as ArrayBuffer);
  }

  // ======================================================
  // ==================== Build Service ===================
  // ======================================================

  async build(): Promise<RSAService> {
    await this.validation();

    return RSAService._create({
      localKeyPair: this.localKeyPair!,
      remotePublicKey: this.remotePublicKey!,
      localSignatureKeyPair: this.localSignatureKeyPair!,
      remoteSignaturePublicKey: this.remoteSignaturePublicKey!,
      deps: this.deps,
    });
  }

  // ======================================================
  // ==================== Private Methods =================
  // ======================================================

  private async generateKeyPair(): Promise<void> {
    this.localKeyPair ??= (await this.deps._generateKeyPairUseCase.execute({
      algorithm: {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
      },
      isExtractable: true,
      keyUsages: ['encrypt', 'decrypt'],
    })) as CryptoKeyPair;
  }

  private async signatureKeyPair(): Promise<void> {
    this.localSignatureKeyPair ??=
      (await this.deps._generateKeyPairUseCase.execute({
        algorithm: {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        isExtractable: true,
        keyUsages: [this.signMode!],
      })) as CryptoKeyPair;
  }

  private async validation(): Promise<void> {
    if (this.mode === Mode.ENCRYPT || this.mode === Mode.DECRYPT)
      if (!this.remotePublicKey) await this.generateKeyPair();

    if (this.signMode === SignMode.SIGN || this.signMode === SignMode.VERIFY)
      if (!this.remoteSignaturePublicKey) await this.signatureKeyPair();
  }
}
