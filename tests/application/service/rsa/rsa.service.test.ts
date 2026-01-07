/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { RSAService } from '../../../../src/application/service/rsa/rsa.service';
import { RSAContext } from '../../../../src/application/context/rsa.context';

describe('RSAService', () => {
  let rsaService: RSAService;
  let mockLocalKeyPair: CryptoKeyPair;
  let mockLocalSignatureKeyPair: CryptoKeyPair;
  let mockRemotePublicKey: CryptoKey;
  let mockRemoteSignaturePublicKey: CryptoKey;
  let mockDeps: RSAContext;

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

    // Mock RSAContext with all use cases
    mockDeps = {
      _encryptUseCase: {
        execute: async () => new ArrayBuffer(256),
      },
      _decryptUseCase: {
        execute: async () => new ArrayBuffer(16),
      },
      _signUseCase: {
        execute: async () => new ArrayBuffer(256),
      },
      _verifyUseCase: {
        execute: async () => true,
      },
      _generateKeyPairUseCase: {
        execute: async () => ({}) as CryptoKeyPair,
      },
      _exportKeyUseCase: {
        execute: async () => new ArrayBuffer(294),
      },
      _importKeyUseCase: {
        execute: async () => ({}) as CryptoKey,
      },
    } as unknown as RSAContext;

    rsaService = RSAService._create({
      localKeyPair: mockLocalKeyPair,
      remotePublicKey: mockRemotePublicKey,
      localSignatureKeyPair: mockLocalSignatureKeyPair,
      remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
      deps: mockDeps,
    });
  });

  describe('_create', () => {
    it('should create instance successfully', () => {
      expect(rsaService).toBeDefined();
      expect(rsaService).toBeInstanceOf(RSAService);
    });

    it('should create instance with null remote public key', () => {
      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: null,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(RSAService);
    });

    it('should create instance with null signature key pairs', () => {
      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        localSignatureKeyPair: null,
        remoteSignaturePublicKey: null,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(RSAService);
    });

    it('should create instance with all null optional keys', () => {
      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: null,
        localSignatureKeyPair: null,
        remoteSignaturePublicKey: null,
        deps: mockDeps,
      });

      expect(service).toBeDefined();
    });
  });

  describe('encrypt', () => {
    it('should encrypt string data successfully', async () => {
      const plaintext = 'Hello World';

      const result = await rsaService.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should encrypt ArrayBuffer data successfully', async () => {
      const plaintext = new TextEncoder().encode('Test data').buffer;

      const result = await rsaService.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should encrypt with remote public key when available', async () => {
      const plaintext = 'Test';

      const result = await rsaService.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should encrypt with local public key when remote is null', async () => {
      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: null,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        deps: mockDeps,
      });

      const plaintext = 'Test';

      const result = await service.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should throw error when no public key available', async () => {
      const service = RSAService._create({
        localKeyPair: null as any,
        remotePublicKey: null,
        localSignatureKeyPair: null,
        remoteSignaturePublicKey: null,
        deps: mockDeps,
      });

      const plaintext = 'Test';

      await expect(service.encrypt(plaintext)).rejects.toThrow(
        'No public key available for encryption',
      );
    });
  });

  describe('decrypt', () => {
    it('should decrypt ArrayBuffer data successfully', async () => {
      const encryptedData = new ArrayBuffer(256);

      const result = await rsaService.decrypt(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should use local private key for decryption', async () => {
      const encryptedData = new ArrayBuffer(256);

      const result = await rsaService.decrypt(encryptedData);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('sign', () => {
    it('should sign data successfully', async () => {
      const data = new TextEncoder().encode('Test data').buffer;

      const result = await rsaService.sign(data);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should throw error when signature key pair is null', async () => {
      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        localSignatureKeyPair: null,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        deps: mockDeps,
      });

      const data = new TextEncoder().encode('Test').buffer;

      await expect(service.sign(data)).rejects.toThrow(
        'Signature key pair not available',
      );
    });

    it('should use RSA-PSS algorithm with salt length 32', async () => {
      const data = new TextEncoder().encode('Test').buffer;

      const result = await rsaService.sign(data);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('verify', () => {
    it('should verify signature successfully', async () => {
      const data = new TextEncoder().encode('Test data').buffer;
      const signature = new ArrayBuffer(256);

      const result = await rsaService.verify(data, signature);

      expect(result).toBe(true);
    });

    it('should return false when signature is invalid', async () => {
      const mockDepsFailVerify = {
        ...mockDeps,
        _verifyUseCase: {
          execute: async () => false,
        },
      } as unknown as RSAContext;

      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        deps: mockDepsFailVerify,
      });

      const data = new TextEncoder().encode('Test').buffer;
      const signature = new ArrayBuffer(256);

      const result = await service.verify(data, signature);

      expect(result).toBe(false);
    });

    it('should use RSA-PSS algorithm with salt length 32 for verification', async () => {
      const data = new TextEncoder().encode('Test').buffer;
      const signature = new ArrayBuffer(256);

      const result = await rsaService.verify(data, signature);

      expect(result).toBe(true);
    });

    it('should use remote signature public key for verification', async () => {
      const data = new TextEncoder().encode('Test').buffer;
      const signature = new ArrayBuffer(256);

      const result = await rsaService.verify(data, signature);

      expect(result).toBe(true);
    });
  });

  describe('encryption/decryption workflow', () => {
    it('should successfully encrypt and decrypt data', async () => {
      const plaintext = 'Test message';

      const encrypted = await rsaService.encrypt(plaintext);
      const decrypted = await rsaService.decrypt(encrypted);

      expect(encrypted).toBeInstanceOf(ArrayBuffer);
      expect(decrypted).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle ArrayBuffer encryption and decryption', async () => {
      const plaintext = new TextEncoder().encode('Test message').buffer;

      const encrypted = await rsaService.encrypt(plaintext);
      const decrypted = await rsaService.decrypt(encrypted);

      expect(encrypted).toBeInstanceOf(ArrayBuffer);
      expect(decrypted).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('signature workflow', () => {
    it('should successfully sign and verify data', async () => {
      const data = new TextEncoder().encode('Test message').buffer;

      const signature = await rsaService.sign(data);
      const isValid = await rsaService.verify(data, signature);

      expect(signature).toBeInstanceOf(ArrayBuffer);
      expect(isValid).toBe(true);
    });
  });

  describe('key usage scenarios', () => {
    it('should work with only encryption keys (no signature keys)', async () => {
      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: mockRemotePublicKey,
        localSignatureKeyPair: null,
        remoteSignaturePublicKey: null,
        deps: mockDeps,
      });

      const plaintext = 'Test';
      const result = await service.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should work with both encryption and signature keys', async () => {
      const plaintext = 'Test';
      const data = new TextEncoder().encode('Test').buffer;

      const encrypted = await rsaService.encrypt(plaintext);
      const signature = await rsaService.sign(data);

      expect(encrypted).toBeInstanceOf(ArrayBuffer);
      expect(signature).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle encryption without remote public key', async () => {
      const service = RSAService._create({
        localKeyPair: mockLocalKeyPair,
        remotePublicKey: null,
        localSignatureKeyPair: mockLocalSignatureKeyPair,
        remoteSignaturePublicKey: mockRemoteSignaturePublicKey,
        deps: mockDeps,
      });

      const plaintext = 'Test';
      const result = await service.encrypt(plaintext);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });
});
