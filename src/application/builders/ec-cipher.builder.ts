import { ECDSA_HASH_BY_CURVE } from '../../domain/crypto/ecdsa';
import { HMAC_KEY_LENGTH_BITS } from '../../domain/crypto/hmac';
import { Mode, SignMode } from '../../domain/types/client.type';
import {
  CipherSuite,
  ECCurve,
  ECDSAHashAlgorithm,
} from '../../domain/types/EC.types';
import { HMacLength, HMACMode } from '../../domain/types/hmac.types';
import { arrayBufferToBase64 } from '../../shared/utils/converter.util';
import { ECCipherContext } from '../context/ec-cipher.context';
import { ECCipherService } from '../service/ec/ec-cipher.service';
import { transformKeyFormat } from '../utils/key-format.util';

export class ECCipherBuilder {
  private curve: ECCurve = ECCurve.P256;
  private cipherSuite: CipherSuite = CipherSuite.AES_256_GCM_SHA256;
  private mode: Mode | null = null;
  private signMode: SignMode | null = null;
  private hmacMode: HMACMode | null = null;
  private remotePublicKey: CryptoKey | null = null;
  private remoteSignaturePublicKey: CryptoKey | null = null;
  private hmacKey: CryptoKey | null = null;
  private localKeyPair: CryptoKeyPair | null = null;
  private localSignatureKeyPair: CryptoKeyPair | null = null;

  constructor(private readonly deps: ECCipherContext) {}

  // ======================================================
  // ==================== Config Methods ==================
  // ======================================================

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

  withSignMode(signMode: SignMode): this {
    this.signMode = signMode;
    return this;
  }

  withHMac(hmacMode: HMACMode): this {
    this.hmacMode = hmacMode;
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
          algorithm: { name: 'ECDH', namedCurve: this.curve },
          isExtractable: false,
          keyUsages: [],
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
          algorithm: {
            name: 'ECDSA',
            namedCurve: this.curve,
            hash: ECDSA_HASH_BY_CURVE[this.curve] as ECDSAHashAlgorithm,
          },
          isExtractable: false,
          keyUsages: [SignMode.VERIFY],
        },
      );
    }
    return this;
  }

  async withRemoteHmacKey(remoteKey: string | CryptoKey): Promise<this> {
    if (remoteKey instanceof CryptoKey) {
      this.hmacKey = remoteKey;
    } else {
      const keyBuffer = new TextEncoder().encode(remoteKey);

      this.hmacKey = await this.deps._importKeyUseCase.execute(keyBuffer, {
        format: 'raw',
        algorithm: {
          name: 'HMAC',
          hash: ECDSA_HASH_BY_CURVE[this.curve] as ECDSAHashAlgorithm,
        },
        isExtractable: false,
        keyUsages: ['sign', 'verify'],
      });
    }
    return this;
  }

  // ======================================================
  // ==================== Get Local Keys ==================
  // ======================================================

  async getPublicKey(): Promise<string> {
    await this.ensureKeyPair();
    const spki = await this.deps._exportKeyUseCase.execute({
      format: 'spki',
      key: this.localKeyPair!.publicKey,
    });
    return arrayBufferToBase64(spki as ArrayBuffer);
  }

  async getSignaturePublicKey(): Promise<string> {
    if (this.signMode !== SignMode.SIGN)
      throw new Error('Sign mode is not SIGN, no signature key available');

    await this.signatureKeyPair();
    const spki = await this.deps._exportKeyUseCase.execute({
      format: 'spki',
      key: this.localSignatureKeyPair!.publicKey,
    });
    return arrayBufferToBase64(spki as ArrayBuffer);
  }

  async getHMacKey(): Promise<string> {
    if (this.hmacMode !== HMACMode.ENABLE)
      throw new Error('HMAC mode is not ENABLE, no HMAC key available');

    await this.keyHMac();
    const raw = await this.deps._exportKeyUseCase.execute({
      format: 'raw',
      key: this.hmacKey!,
    });
    return arrayBufferToBase64(raw as ArrayBuffer);
  }

  // ======================================================
  // ==================== Build Service ===================
  // ======================================================

  async build(): Promise<ECCipherService> {
    if (this.mode === Mode.ENCRYPT || this.mode === Mode.DECRYPT) {
      if (!this.remotePublicKey) throw new Error('Remote public key not set');
      await this.ensureKeyPair();
    }

    if (this.signMode === SignMode.SIGN) await this.signatureKeyPair();
    if (this.hmacMode === HMACMode.ENABLE) await this.keyHMac();

    return ECCipherService._create({
      localKeyPair: this.localKeyPair!,
      localSignatureKeyPair: this.localSignatureKeyPair!,
      remotePublicKey: this.remotePublicKey!,
      remoteSignaturePublicKey: this.remoteSignaturePublicKey!,
      cipherSuite: this.cipherSuite,
      mode: this.mode!,
      curve: this.curve,
      hmacKey: this.hmacKey,
      deps: this.deps,
    });
  }

  // ======================================================
  // ==================== Private Methods =================
  // ======================================================

  private async ensureKeyPair(): Promise<void> {
    if (!this.localKeyPair) {
      this.localKeyPair = (await this.deps._generateKeyPairUseCase.execute({
        algorithm: { name: 'ECDH', namedCurve: this.curve },
        isExtractable: true,
        keyUsages: ['deriveBits'],
      })) as CryptoKeyPair;
    }
  }

  private async signatureKeyPair(): Promise<void> {
    if (!this.localSignatureKeyPair) {
      const hash = ECDSA_HASH_BY_CURVE[this.curve] as ECDSAHashAlgorithm;

      this.localSignatureKeyPair =
        (await this.deps._generateKeyPairUseCase.execute({
          algorithm: { name: 'ECDSA', namedCurve: this.curve, hash },
          isExtractable: true,
          keyUsages: [SignMode.SIGN],
        })) as CryptoKeyPair;
    }
  }

  private async keyHMac(): Promise<void> {
    if (!this.hmacKey) {
      const hash = ECDSA_HASH_BY_CURVE[this.curve] as ECDSAHashAlgorithm;
      const lenght = HMAC_KEY_LENGTH_BITS[this.curve] as HMacLength;

      this.hmacKey = (await this.deps._generateKeyPairUseCase.execute({
        algorithm: { name: 'HMAC', hash, length: lenght! },
        isExtractable: true,
        keyUsages: ['sign', 'verify'],
      })) as CryptoKey;
    }
  }
}
