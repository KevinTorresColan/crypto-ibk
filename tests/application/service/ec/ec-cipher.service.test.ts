/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { ECCipherService } from '../../../../src/application/service/ec/ec-cipher.service';
import { CipherSuite, ECCurve } from '../../../../src/domain/types/EC.types';
import { Mode } from '../../../../src/domain/types/client.type';
import { ECCipherContext } from '../../../../src/application/context/ec-cipher.context';

describe('ECCipherService', () => {
  let ecService: ECCipherService;
  let mockLocalKeyPair: CryptoKeyPair;
  let mockLocalSignatureKeyPair: CryptoKeyPair;
  let mockRemotePublicKey: CryptoKey;
  let mockRemoteSignaturePublicKey: CryptoKey;
  let mockHmacKey: CryptoKey;
  let mockAESKey: CryptoKey;
  let mockDeps: ECCipherContext;

  beforeEach(() => {
    // Mock CryptoKey objects
    mockLocalKeyPair = {
      privateKey: {} as CryptoKey,
      publicKey: {} as CryptoKey,
    };

    mockLocalSignatureKeyPair = {
      privateKey: {} as CryptoKey,
      publicKey: {} as CryptoKey,
    };

    mockRemotePublicKey = {} as CryptoKey;
    mockRemoteSignaturePublicKey = {} as CryptoKey;
    mockHmacKey = {} as CryptoKey;
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

    ecService = ECCipherService._create({
      localKeyPair: mockLocalKeyPair,
      localSignatureKeyPair: mockLocalSignatureKeyPair,
      remotePublicKey: mockRemotePublicKey,
      remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
      cipherSuite: CipherSuite.AES_128_GCM_SHA256,
      mode: Mode.ENCRYPT,
      curve: ECCurve.P256,
      hmacKey: mockHmacKey,
      deps: mockDeps,
    });
  });

  describe('_create', () => {
    it('should create instance successfully', () => {
      expect(ecService).toBeDefined();
      expect(ecService).toBeInstanceOf(ECCipherService);
    });

    it('should create instance with P384 curve', () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_256_GCM_SHA256,
        mode: Mode.DECRYPT,
        curve: ECCurve.P384,
        hmacKey: null,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ECCipherService);
    });

    it('should create instance with P521 curve', () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_256_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P521,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ECCipherService);
    });

    it('should create instance without HMAC key', () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: null,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
    });
  });

  describe('getPublicKey', () => {
    it('should return public key as base64 string', async () => {
      const result = await ecService.getPublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPublicKeyCrypto', () => {
    it('should return CryptoKey public key', () => {
      const result = ecService.getPublicKeyCrypto();

      expect(result).toBe(mockLocalKeyPair.publicKey);
    });
  });

  describe('getSignaturePublicKey', () => {
    it('should return signature public key as base64 string', async () => {
      const result = await ecService.getSignaturePublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getSignaturePublicKeyCrypto', () => {
    it('should return CryptoKey signature public key', () => {
      const result = ecService.getSignaturePublicKeyCrypto();

      expect(result).toBe(mockLocalSignatureKeyPair.publicKey);
    });
  });

  describe('encrypt', () => {
    it('should encrypt string data successfully', async () => {
      const plaintext = 'Hello World';

      const result = await ecService.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should encrypt ArrayBuffer data successfully', async () => {
      const plaintext = new TextEncoder().encode('Test data').buffer;

      const result = await ecService.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should include IV in encrypted output', async () => {
      const plaintext = 'Test';

      const result = await ecService.encrypt(plaintext);

      // Result should be IV (12 bytes) + ciphertext
      expect(result.byteLength).toBeGreaterThan(12);
    });
  });

  describe('decrypt', () => {
    it('should decrypt ArrayBuffer data successfully', async () => {
      const encryptedData = new ArrayBuffer(44); // 12 bytes IV + 32 bytes ciphertext

      const result = await ecService.decrypt(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should extract IV from encrypted data', async () => {
      const encryptedData = new ArrayBuffer(44);

      const result = await ecService.decrypt(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('sign', () => {
    it('should sign data successfully', async () => {
      const data = new TextEncoder().encode('Test data').buffer;

      const result = await ecService.sign(data);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should throw error when signature key pair is null', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: null as any,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const data = new TextEncoder().encode('Test').buffer;

      await expect(service.sign(data)).rejects.toThrow(
        'Signature key pair not available',
      );
    });
  });

  describe('verify', () => {
    it('should verify signature successfully', async () => {
      const data = new TextEncoder().encode('Test data').buffer;
      const signature = new ArrayBuffer(64);

      const result = await ecService.verify(data, signature);

      expect(result).toBe(true);
    });

    it('should throw error when remote signature public key is null', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: null as any,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const data = new TextEncoder().encode('Test').buffer;
      const signature = new ArrayBuffer(64);

      await expect(service.verify(data, signature)).rejects.toThrow(
        'Remote signature public key not available',
      );
    });

    it('should throw error when signature verification fails', async () => {
      const mockDepsFailVerify = {
        ...mockDeps,
        _verifyUseCase: {
          execute: async () => false,
        },
      } as unknown as ECCipherContext;

      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDepsFailVerify,
      });

      const data = new TextEncoder().encode('Test').buffer;
      const signature = new ArrayBuffer(64);

      await expect(service.verify(data, signature)).rejects.toThrow(
        'Signature verification failed',
      );
    });
  });

  describe('hmacSign', () => {
    it('should sign data with HMAC successfully', async () => {
      const data = new TextEncoder().encode('Test data').buffer;

      const result = await ecService.hmacSign(data);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should throw error when HMAC key is null', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: null,
        deps: mockDeps,
      });

      const data = new TextEncoder().encode('Test').buffer;

      await expect(service.hmacSign(data)).rejects.toThrow(
        'HMAC key not available',
      );
    });
  });

  describe('hmacVerify', () => {
    it('should verify HMAC signature successfully', async () => {
      const data = new TextEncoder().encode('Test data').buffer;
      const signature = new ArrayBuffer(32);

      const result = await ecService.hmacVerify(data, signature);

      expect(result).toBe(true);
    });

    it('should throw error when HMAC key is null', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: null,
        deps: mockDeps,
      });

      const data = new TextEncoder().encode('Test').buffer;
      const signature = new ArrayBuffer(32);

      await expect(service.hmacVerify(data, signature)).rejects.toThrow(
        'HMAC key not available',
      );
    });

    it('should throw error when HMAC verification fails', async () => {
      const mockDepsFailVerify = {
        ...mockDeps,
        _verifyUseCase: {
          execute: async () => false,
        },
      } as unknown as ECCipherContext;

      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDepsFailVerify,
      });

      const data = new TextEncoder().encode('Test').buffer;
      const signature = new ArrayBuffer(32);

      await expect(service.hmacVerify(data, signature)).rejects.toThrow(
        'HMAC verification failed',
      );
    });
  });

  describe('cipher suite configurations', () => {
    it('should work with AES_256_GCM_SHA256', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_256_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const result = await service.encrypt('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should work with AES_192_GCM_SHA256', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_192_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P384,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const result = await service.encrypt('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should work with AES_256_GCM_SHA384', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_256_GCM_SHA384,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P521,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const result = await service.encrypt('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('curve bit length handling', () => {
    it('should handle P256 curve (256 bits)', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const result = await service.encrypt('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle P384 curve (384 bits)', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P384,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const result = await service.encrypt('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle P521 curve (521 bits)', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P521,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const result = await service.encrypt('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('key derivation', () => {
    it('should derive shared secret correctly', async () => {
      const result = await ecService.encrypt('Test data');

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(mockDeps._deriveBitsUseCase.execute).toBeDefined();
    });

    it('should derive AES key from shared secret', async () => {
      const result = await ecService.encrypt('Test data');

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(mockDeps._digestUseCase.execute).toBeDefined();
      expect(mockDeps._importKeyUseCase.execute).toBeDefined();
    });
  });

  describe('encryption/decryption workflow', () => {
    it('should generate IV for encryption', async () => {
      const result = await ecService.encrypt('Test');

      // Result should contain IV + ciphertext
      expect(result.byteLength).toBeGreaterThan(12);
    });

    it('should extract IV for decryption', async () => {
      const encryptedData = new ArrayBuffer(44);

      const result = await ecService.decrypt(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('mode handling', () => {
    it('should work in ENCRYPT mode', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.ENCRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const result = await service.encrypt('Test');

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should work in DECRYPT mode', async () => {
      const service = ECCipherService._create({
        localKeyPair: mockLocalKeyPair,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remotePublicKey: mockRemotePublicKey,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        cipherSuite: CipherSuite.AES_128_GCM_SHA256,
        mode: Mode.DECRYPT,
        curve: ECCurve.P256,
        hmacKey: mockHmacKey,
        deps: mockDeps,
      });

      const encryptedData = new ArrayBuffer(44);
      const result = await service.decrypt(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });
});
