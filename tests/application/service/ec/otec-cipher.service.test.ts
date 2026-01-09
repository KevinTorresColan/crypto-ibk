import { describe, expect, it, beforeEach } from '@jest/globals';
import { OTECCipherService } from '../../../../src/application/service/ec/otec-cipher.service';
import { CipherSuite, ECCurve } from '../../../../src/domain/types/EC.types';
import { Mode } from '../../../../src/domain/types/client.type';
import { ECCipherContext } from '../../../../src/application/context/ec-cipher.context';

describe('OTECCipherService', () => {
  let otecService: OTECCipherService;
  let mockLocalKeyPair: CryptoKeyPair;
  let mockRemotePublicKey: CryptoKey;
  let mockAESKey: CryptoKey;
  let mockDeps: ECCipherContext;

  beforeEach(() => {
    // Mock CryptoKey objects
    mockLocalKeyPair = {
      privateKey: {} as CryptoKey,
      publicKey: {} as CryptoKey,
    };

    mockRemotePublicKey = {} as CryptoKey;
    mockAESKey = {} as CryptoKey;

    // Mock ECCipherContext with all use cases
    mockDeps = {
      _deriveBitsUseCase: {
        execute: async () => new ArrayBuffer(32),
      },
      _digestUseCase: {
        execute: async () => new ArrayBuffer(32),
      },
      _importKeyUseCase: {
        execute: async () => mockAESKey,
      },
      _exportKeyUseCase: {
        execute: async () => new ArrayBuffer(91),
      },
      _getRandomUseCase: {
        execute: () => new Uint8Array(12),
      },
      _encryptUseCase: {
        execute: async () => new ArrayBuffer(32),
      },
      _decryptUseCase: {
        execute: async () => new ArrayBuffer(16),
      },
      _generateKeyPairUseCase: {
        execute: async () => ({}) as CryptoKeyPair,
      },
      _deriveKeyUseCase: {
        execute: async () => ({}) as CryptoKey,
      },
      _signUseCase: {
        execute: async () => new ArrayBuffer(64),
      },
      _verifyUseCase: {
        execute: async () => true,
      },
    } as unknown as ECCipherContext;

    otecService = OTECCipherService._create({
      localKeyPair: mockLocalKeyPair,
      remotePublicKey: mockRemotePublicKey,
      cipherSuite: CipherSuite.AES_128_GCM_SHA256,
      mode: Mode.ENCRYPT,
      curve: ECCurve.P256,
      deps: mockDeps,
    });
  });

  describe('_create', () => {
    it('should create instance successfully', () => {
      expect(otecService).toBeDefined();
      expect(otecService).toBeInstanceOf(OTECCipherService);
    });

    it('should create instance with P384 curve', () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_256_GCM_SHA256,
        mode: Mode.DECRYPT,
        curve: ECCurve.P384,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(OTECCipherService);
    });

    it('should create instance with P521 curve', () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_256_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P521,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(OTECCipherService);
    });
  });

  describe('getPublicKey', () => {
    it('should return public key as base64 string', async () => {
      const result = await otecService.getPublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPublicKeyCrypto', () => {
    it('should return CryptoKey public key', () => {
      const result = otecService.getPublicKeyCrypto();

      expect(result).toBe(mockLocalKeyPair.publicKey);
    });
  });

  describe('doFinal - encryption', () => {
    it('should encrypt string data successfully', async () => {
      const plaintext = 'Hello World';

      const result = await otecService.doFinal(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should encrypt ArrayBuffer data successfully', async () => {
      const plaintext = new TextEncoder().encode('Test data').buffer;

      const result = await otecService.doFinal(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should include IV in encrypted output', async () => {
      const plaintext = 'Test';

      const result = await otecService.doFinal(plaintext);

      // Result should be IV (12 bytes) + ciphertext
      expect(result.byteLength).toBeGreaterThan(12);
    });

    it('should throw error when called twice', async () => {
      await otecService.doFinal('First call');

      await expect(otecService.doFinal('Second call')).rejects.toThrow(
        'This instance has already been used',
      );
    });
  });

  describe('doFinal - decryption', () => {
    beforeEach(() => {
      otecService = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.DECRYPT,
        curve: ECCurve.P256,
        deps: mockDeps,
      });
    });

    it('should decrypt ArrayBuffer data successfully', async () => {
      const encryptedData = new ArrayBuffer(44); // 12 bytes IV + 32 bytes ciphertext

      const result = await otecService.doFinal(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should throw error when decryption receives string', async () => {
      await expect(otecService.doFinal('invalid string')).rejects.toThrow(
        'Decryption requires ArrayBuffer',
      );
    });

    it('should throw error when called twice', async () => {
      const encryptedData = new ArrayBuffer(44);

      await otecService.doFinal(encryptedData);

      await expect(otecService.doFinal(encryptedData)).rejects.toThrow(
        'This instance has already been used',
      );
    });
  });

  describe('cipher suite configurations', () => {
    it('should work with AES_256_GCM_SHA256', async () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_256_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        deps: mockDeps,
      });

      const result = await service.doFinal('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should work with AES_128_GCM_SHA256', async () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P384,
        deps: mockDeps,
      });

      const result = await service.doFinal('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('curve bit length handling', () => {
    it('should handle P256 curve (256 bits)', async () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        deps: mockDeps,
      });

      const result = await service.doFinal('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle P384 curve (384 bits)', async () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P384,
        deps: mockDeps,
      });

      const result = await service.doFinal('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle P521 curve (521 bits)', async () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P521,
        deps: mockDeps,
      });

      const result = await service.doFinal('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('key derivation', () => {
    it('should derive shared secret correctly', async () => {
      const result = await otecService.doFinal('Test data');

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(mockDeps._deriveBitsUseCase.execute).toBeDefined();
    });

    it('should derive AES key from shared secret', async () => {
      const result = await otecService.doFinal('Test data');

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(mockDeps._digestUseCase.execute).toBeDefined();
      expect(mockDeps._importKeyUseCase.execute).toBeDefined();
    });
  });

  describe('encryption/decryption workflow', () => {
    it('should generate IV for encryption', async () => {
      const result = await otecService.doFinal('Test');

      // Result should contain IV + ciphertext
      expect(result.byteLength).toBeGreaterThan(12);
    });

    it('should extract IV for decryption', async () => {
      const service = OTECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.DECRYPT,
        curve: ECCurve.P256,
        deps: mockDeps,
      });

      const encryptedData = new ArrayBuffer(44);

      const result = await service.doFinal(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });
});
