/**
 * =============================================
 * ECC Cryptography Library (WebCrypto API)
 * =============================================
 * One-Time Encryption Cipher with ECDH Key Exchange
 * Pattern: Builder + Single-Use Cipher (similar to Kotlin OTECCipher)
 * =============================================
 */

// ============ ENUMS ============
export enum CipherSuite {
  AES_256_GCM_SHA256 = 'AES_256_GCM_SHA256',
  AES_192_GCM_SHA256 = 'AES_192_GCM_SHA256',
  AES_128_GCM_SHA256 = 'AES_128_GCM_SHA256',
  AES_256_GCM_SHA384 = 'AES_256_GCM_SHA384',
}

export enum ECCurve {
  P256 = 'P-256', // SECP256R1
  P384 = 'P-384', // SECP384R1
  P521 = 'P-521', // SECP521R1
}

export enum Mode {
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt',
}

// ============ INTERFACES ============
export interface EncryptResult {
  ephemeralPublicKey: string; // SPKI base64
  ciphertext: string; // iv + cipherText + tag (concatenado)
  cipherSuite?: CipherSuite;
  curve?: ECCurve;
  ivB64?: string; // opcional
}

export interface CipherSuiteConfig {
  algorithm: 'AES-GCM';
  keySizeBits: 128 | 192 | 256;
  hashAlgorithm: 'SHA-256' | 'SHA-384';
  keySizeBytes: number;
  tagLengthBits: number;
  ivLengthBytes: number;
}

// ============ UTILITIES ============
const subtle = crypto.subtle;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [\w\s]+-----/, '')
    .replace(/-----END [\w\s]+-----/, '')
    .replace(/\s+/g, '');
  return base64ToArrayBuffer(b64);
}

// ============ CIPHER SUITE MAPPING ============
const CIPHER_SUITE_CONFIGS: Record<CipherSuite, CipherSuiteConfig> = {
  [CipherSuite.AES_256_GCM_SHA256]: {
    algorithm: 'AES-GCM',
    keySizeBits: 256,
    hashAlgorithm: 'SHA-256',
    keySizeBytes: 32,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
  [CipherSuite.AES_192_GCM_SHA256]: {
    algorithm: 'AES-GCM',
    keySizeBits: 192,
    hashAlgorithm: 'SHA-256',
    keySizeBytes: 24,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
  [CipherSuite.AES_128_GCM_SHA256]: {
    algorithm: 'AES-GCM',
    keySizeBits: 128,
    hashAlgorithm: 'SHA-256',
    keySizeBytes: 16,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
  [CipherSuite.AES_256_GCM_SHA384]: {
    algorithm: 'AES-GCM',
    keySizeBits: 256,
    hashAlgorithm: 'SHA-384',
    keySizeBytes: 32,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
};

// ============ MAIN CLASS: OTECCipher ============
export class OTECCipher {
  private state: 'INITIALIZED' | 'FINALIZED' = 'INITIALIZED';
  private aesKey!: CryptoKey;
  private config: CipherSuiteConfig;
  private mode: Mode;

  private constructor(
    private localKeyPair: CryptoKeyPair,
    private remotePublicKey: CryptoKey,
    cipherSuite: CipherSuite,
    mode: Mode,
    private readonly curve: ECCurve,
    private readonly used: boolean = false,
  ) {
    this.config = CIPHER_SUITE_CONFIGS[cipherSuite];
    this.mode = mode;
  }

  /**
   * Single-use encryption/decryption (like Kotlin's doFinal)
   */
  async doFinal(data: ArrayBuffer | string): Promise<ArrayBuffer> {
    if (this.state === 'FINALIZED') {
      throw new Error('This instance has already been used');
    }
    this.state = 'FINALIZED';
    console.log('---------------DO FINAL:', data);

    // Generate shared secret via ECDH
    const sharedSecret = await this.deriveSharedSecret();

    // Derive AES key (matching Kotlin's SecretKeyDeriver)
    this.aesKey = await this.deriveAESKey(sharedSecret);
    // Process data based on mode
    if (this.mode === Mode.ENCRYPT) {
      return this.encryptInternal(data);
    } else {
      if (typeof data === 'string') {
        throw new Error('Decryption requires ArrayBuffer');
      }
      return this.decryptInternal(data);
    }
  }

  /**
   * Get local public key for transmission to remote party
   */
  async getPublicKey(): Promise<string> {
    const spki = await subtle.exportKey('spki', this.localKeyPair.publicKey);
    return arrayBufferToBase64(spki);
  }

  /**
   * Get local public key as CryptoKey (for WebCrypto operations)
   */
  getPublicKeyCrypto(): CryptoKey {
    return this.localKeyPair.publicKey;
  }

  // ============ PRIVATE METHODS ============
  private async deriveSharedSecret(): Promise<ArrayBuffer> {
    // ECDH key agreement (like Kotlin's SharedSecretDeriver)
    const sharedSecret = await subtle.deriveBits(
      {
        name: 'ECDH',
        public: this.remotePublicKey,
      },
      this.localKeyPair.privateKey,
      this.getCurveBitLength(),
    );
    return sharedSecret;
  }

  private async deriveAESKey(sharedSecret: ArrayBuffer): Promise<CryptoKey> {
    // Hash the shared secret (matching Kotlin's SecretKeyDeriver)
    const hashed = await subtle.digest(this.config.hashAlgorithm, sharedSecret);

    // Take first N bytes (N = keySizeBytes)
    const keyBytes = hashed.slice(0, this.config.keySizeBytes);

    // Import as AES-GCM key (non-extractable for security)
    return subtle.importKey(
      'raw',
      keyBytes,
      {
        name: this.config.algorithm,
        length: this.config.keySizeBits,
      },
      false, // not extractable
      [this.mode], // only allow encrypt or decrypt
    );
  }

  private async encryptInternal(
    data: ArrayBuffer | string,
  ): Promise<ArrayBuffer> {
    const plaintext =
      typeof data === 'string'
        ? new TextEncoder().encode(data)
        : new Uint8Array(data);

    // Generate IV (matching AESGCMCipher in Kotlin)
    const iv = crypto.getRandomValues(
      new Uint8Array(this.config.ivLengthBytes),
    );

    // Encrypt with AES-GCM
    const ciphertext = await subtle.encrypt(
      {
        name: this.config.algorithm,
        iv,
        tagLength: this.config.tagLengthBits,
      },
      this.aesKey,
      plaintext,
    );

    // Return iv + ciphertext (matching Kotlin's format)
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(ciphertext), iv.length);
    return result.buffer;
  }

  private async decryptInternal(
    encryptedData: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    // Split iv + ciphertext (matching Kotlin's format)
    const iv = encryptedData.slice(0, this.config.ivLengthBytes);
    const ciphertext = encryptedData.slice(this.config.ivLengthBytes);

    // Decrypt with AES-GCM
    const plaintext = await subtle.decrypt(
      {
        name: this.config.algorithm,
        iv,
        tagLength: this.config.tagLengthBits,
      },
      this.aesKey,
      ciphertext,
    );
    console.log('-------------------DES plaintext:', plaintext);

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

  // ============ BUILDER ============
  static Builder = class {
    private used: boolean = false;
    private curve: ECCurve = ECCurve.P256;
    private cipherSuite: CipherSuite = CipherSuite.AES_256_GCM_SHA256;
    private mode: Mode = Mode.DECRYPT;
    private remotePublicKey: CryptoKey | null = null;
    private localKeyPair: CryptoKeyPair | null = null;

    /**
     * Set elliptic curve (default: P-256 / SECP256R1)
     */
    withCurve(curve: ECCurve): this {
      this.curve = curve;
      // Force regeneration of key pair if curve changes
      this.localKeyPair = null;
      return this;
    }

    /**
     * Set cipher suite (default: AES_256_GCM_SHA256)
     */
    withCipherSuite(cipherSuite: CipherSuite): this {
      this.cipherSuite = cipherSuite;
      return this;
    }

    /**
     * Set operation mode (ENCRYPT or DECRYPT)
     */
    withMode(mode: Mode): this {
      this.mode = mode;
      return this;
    }

    /**
     * Set remote party's public key (REQUIRED before build)
     * Accepts: base64 string, PEM string, or CryptoKey
     */
    async withRemotePublicKey(remoteKey: string | CryptoKey): Promise<this> {
      if (remoteKey instanceof CryptoKey) {
        this.remotePublicKey = remoteKey;
      } else {
        // Import the key from string format
        const keyBuffer = remoteKey.trim().startsWith('-----BEGIN')
          ? pemToArrayBuffer(remoteKey)
          : base64ToArrayBuffer(remoteKey);

        this.remotePublicKey = await subtle.importKey(
          'spki',
          keyBuffer,
          { name: 'ECDH', namedCurve: this.curve },
          false,
          [], // no key usages needed for public key
        );
      }
      return this;
    }

    /**
     * Get local public key (for transmission to remote party)
     */
    async getPublicKey(): Promise<string> {
      await this.ensureKeyPair();
      const spki = await subtle.exportKey('spki', this.localKeyPair!.publicKey);
      return arrayBufferToBase64(spki);
    }

    /**
     * Get local public key as CryptoKey
     */
    async getPublicKeyCrypto(): Promise<CryptoKey> {
      await this.ensureKeyPair();
      return this.localKeyPair!.publicKey;
    }

    /**
     * Build the OTECCipher instance (single-use builder)
     */
    async build(): Promise<OTECCipher> {
      if (this.used) {
        throw new Error('This builder has already been used');
      }

      if (!this.remotePublicKey) {
        throw new Error(
          'Remote public key not set. Call withRemotePublicKey() first.',
        );
      }

      await this.ensureKeyPair();
      this.used = true;

      return new OTECCipher(
        this.localKeyPair!,
        this.remotePublicKey,
        this.cipherSuite,
        this.mode,
        this.curve,
        true,
      );
    }

    /**
     * Create a copy of this builder with new keys
     */
    copy(): typeof this {
      const newBuilder = new OTECCipher.Builder()
        .withCurve(this.curve)
        .withCipherSuite(this.cipherSuite)
        .withMode(this.mode);

      // Copy remote public key if set (as reference)
      if (this.remotePublicKey) {
        newBuilder.remotePublicKey = this.remotePublicKey;
      }

      return newBuilder;
    }

    /**
     * Generate ECDH key pair if not already generated
     */
    private async ensureKeyPair(): Promise<void> {
      if (!this.localKeyPair) {
        this.localKeyPair = await subtle.generateKey(
          {
            name: 'ECDH',
            namedCurve: this.curve,
          },
          true, // extractable for export
          ['deriveBits'], // key usage
        );
      }
    }
  };

  // ============ STATIC FACTORY METHODS ============

  /**
   * Quick encryption (all-in-one)
   */
  static async encrypt(
    remotePublicKey: string | CryptoKey,
    plaintext: string | ArrayBuffer,
    options?: {
      curve?: ECCurve;
      cipherSuite?: CipherSuite;
    },
  ): Promise<EncryptResult> {
    const builder = new OTECCipher.Builder()
      .withMode(Mode.ENCRYPT)
      .withCipherSuite(options?.cipherSuite || CipherSuite.AES_256_GCM_SHA256)
      .withCurve(options?.curve || ECCurve.P256);

    await builder.withRemotePublicKey(remotePublicKey);

    const cipher = await builder.build();
    const ciphertext = await cipher.doFinal(plaintext);

    return {
      ephemeralPublicKey: await builder.getPublicKey(),
      ciphertext: arrayBufferToBase64(ciphertext),
    };
  }

  /**
   * Quick decryption (all-in-one)
   */
  static async decrypt(
    remotePublicKey: string | CryptoKey,
    encryptedData: string | ArrayBuffer,
    options?: {
      curve?: ECCurve;
      cipherSuite?: CipherSuite;
    },
  ): Promise<ArrayBuffer> {
    const builder = new OTECCipher.Builder()
      .withMode(Mode.DECRYPT)
      .withCipherSuite(options?.cipherSuite || CipherSuite.AES_256_GCM_SHA256)
      .withCurve(options?.curve || ECCurve.P256);

    await builder.withRemotePublicKey(remotePublicKey);

    const cipher = await builder.build();

    const encryptedBuffer =
      typeof encryptedData === 'string'
        ? base64ToArrayBuffer(encryptedData)
        : encryptedData;

    return cipher.doFinal(encryptedBuffer);
  }
}

// ============ TYPE GUARDS ============
// export function isCipherSuite(value: string): value is CipherSuite {
//   return Object.values(CipherSuite).includes(value as CipherSuite);
// }

// export function isECCurve(value: string): value is ECCurve {
//   return Object.values(ECCurve).includes(value as ECCurve);
// }

// ============ EXPORT ALL ============
export default {
  OTECCipher,
  CipherSuite,
  ECCurve,
  Mode,
  encrypt: OTECCipher.encrypt,
  decrypt: OTECCipher.decrypt,
};

// ============ EXAMPLE USAGE ============
/**
 * Example 1: Encryption with Builder pattern
 *
 * const builder = new OTECCipher.Builder()
 *   .withCurve(ECCurve.P256)
 *   .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
 *   .withMode(Mode.ENCRYPT);
 *
 * // Get local public key to send to server
 * const localPublicKey = await builder.getPublicKey();
 *
 * // Set server's public key (received from server)
 * await builder.withRemotePublicKey(serverPublicKeyBase64);
 *
 * // Build cipher and encrypt
 * const cipher = await builder.build();
 * const encrypted = await cipher.doFinal("Hello World");
 *
 * // Send { localPublicKey, encrypted } to server
 *
 * Example 2: Quick encryption
 *
 * const result = await OTECCipher.encrypt(
 *   serverPublicKeyBase64,
 *   "Hello World",
 *   { curve: ECCurve.P256, cipherSuite: CipherSuite.AES_256_GCM_SHA256 }
 * );
 *
 * // result contains ephemeralPublicKey and ciphertext
 */
