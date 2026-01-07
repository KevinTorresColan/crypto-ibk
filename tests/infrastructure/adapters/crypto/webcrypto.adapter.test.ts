import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WebCryptoAdapter } from '../../../../src/infrastructure/adapters/crypto/webcrypto.adapter';

describe('WebCryptoAdapter', () => {
  let webCryptoAdapter: WebCryptoAdapter;
  let mockSubtle: jest.Mocked<SubtleCrypto>;
  let mockCrypto: jest.Mocked<Crypto>;

  beforeEach(() => {
    mockSubtle = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      digest: jest.fn(),
      generateKey: jest.fn(),
      deriveKey: jest.fn(),
      deriveBits: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
      wrapKey: jest.fn(),
      unwrapKey: jest.fn(),
    } as unknown as jest.Mocked<SubtleCrypto>;

    mockCrypto = {
      subtle: mockSubtle,
      getRandomValues: jest.fn(),
      randomUUID: jest.fn(),
    } as unknown as jest.Mocked<Crypto>;

    webCryptoAdapter = new WebCryptoAdapter(mockSubtle, mockCrypto);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(webCryptoAdapter).toBeDefined();
    });

    it('should throw error if crypto API is not available', () => {
      expect(() => {
        new WebCryptoAdapter(undefined, {} as Crypto);
      }).toThrow(
        'Web Crypto API (crypto.subtle / crypto.getRandomValues) no disponible en este entorno',
      );
    });
  });

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      const mockKey = {} as CryptoKey;
      const mockData = new TextEncoder().encode('test data');
      const mockEncrypted = new ArrayBuffer(32);
      const algorithm = { name: 'AES-GCM', iv: new Uint8Array(12) };

      mockSubtle.encrypt.mockResolvedValue(mockEncrypted);

      const result = await webCryptoAdapter.encrypt(
        algorithm,
        mockKey,
        mockData,
      );

      expect(result).toBe(mockEncrypted);
      expect(mockSubtle.encrypt).toHaveBeenCalledWith(
        algorithm,
        mockKey,
        mockData,
      );
    });
  });

  describe('decrypt', () => {
    it('should decrypt data successfully', async () => {
      const mockKey = {} as CryptoKey;
      const mockEncryptedData = new ArrayBuffer(32);
      const mockDecrypted = new ArrayBuffer(16);
      const algorithm = { name: 'AES-GCM', iv: new Uint8Array(12) };

      mockSubtle.decrypt.mockResolvedValue(mockDecrypted);

      const result = await webCryptoAdapter.decrypt(
        algorithm,
        mockKey,
        mockEncryptedData,
      );

      expect(result).toBe(mockDecrypted);
      expect(mockSubtle.decrypt).toHaveBeenCalledWith(
        algorithm,
        mockKey,
        mockEncryptedData,
      );
    });
  });

  describe('sign', () => {
    it('should sign data successfully', async () => {
      const mockKey = {} as CryptoKey;
      const mockData = new TextEncoder().encode('test data');
      const mockSignature = new ArrayBuffer(64);
      const algorithm = { name: 'ECDSA', hash: 'SHA-256' };

      mockSubtle.sign.mockResolvedValue(mockSignature);

      const result = await webCryptoAdapter.sign(algorithm, mockKey, mockData);

      expect(result).toBe(mockSignature);
      expect(mockSubtle.sign).toHaveBeenCalledWith(
        algorithm,
        mockKey,
        mockData,
      );
    });
  });

  describe('verify', () => {
    it('should verify signature successfully - valid', async () => {
      const mockKey = {} as CryptoKey;
      const mockData = new TextEncoder().encode('test data');
      const mockSignature = new ArrayBuffer(64);
      const algorithm = { name: 'ECDSA', hash: 'SHA-256' };

      mockSubtle.verify.mockResolvedValue(true);

      const result = await webCryptoAdapter.verify(
        algorithm,
        mockKey,
        mockSignature,
        mockData,
      );

      expect(result).toBe(true);
      expect(mockSubtle.verify).toHaveBeenCalledWith(
        algorithm,
        mockKey,
        mockSignature,
        mockData,
      );
    });

    it('should verify signature successfully - invalid', async () => {
      const mockKey = {} as CryptoKey;
      const mockData = new TextEncoder().encode('test data');
      const mockSignature = new ArrayBuffer(64);
      const algorithm = { name: 'ECDSA', hash: 'SHA-256' };

      mockSubtle.verify.mockResolvedValue(false);

      const result = await webCryptoAdapter.verify(
        algorithm,
        mockKey,
        mockSignature,
        mockData,
      );

      expect(result).toBe(false);
    });
  });

  describe('digest', () => {
    it('should compute digest successfully', async () => {
      const mockData = new TextEncoder().encode('test data');
      const mockHash = new ArrayBuffer(32);

      mockSubtle.digest.mockResolvedValue(mockHash);

      const result = await webCryptoAdapter.digest('SHA-256', mockData);

      expect(result).toBe(mockHash);
      expect(mockSubtle.digest).toHaveBeenCalledWith('SHA-256', mockData);
    });
  });

  describe('generateKey', () => {
    it('should generate key pair successfully', async () => {
      const mockKeyPair = {
        publicKey: {} as CryptoKey,
        privateKey: {} as CryptoKey,
      } as CryptoKeyPair;
      const algorithm = { name: 'ECDH', namedCurve: 'P-256' };

      mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

      const result = await webCryptoAdapter.generateKey(
        algorithm as EcKeyGenParams,
        true,
        ['deriveKey'],
      );

      expect(result).toBe(mockKeyPair);
      expect(mockSubtle.generateKey).toHaveBeenCalledWith(algorithm, true, [
        'deriveKey',
      ]);
    });
  });

  describe('importKey', () => {
    it('should import key successfully', async () => {
      const mockKeyData = new ArrayBuffer(32);
      const mockImportedKey = {} as CryptoKey;
      const algorithm = { name: 'AES-GCM' };

      mockSubtle.importKey.mockResolvedValue(mockImportedKey);

      const result = await webCryptoAdapter.importKey(
        'raw',
        mockKeyData,
        algorithm,
        true,
        ['encrypt'],
      );

      expect(result).toBe(mockImportedKey);
      expect(mockSubtle.importKey).toHaveBeenCalledWith(
        'raw',
        mockKeyData,
        algorithm,
        true,
        ['encrypt'],
      );
    });
  });

  describe('exportKey', () => {
    it('should export key successfully', async () => {
      const mockKey = {} as CryptoKey;
      const mockExportedKey = new ArrayBuffer(32);

      mockSubtle.exportKey.mockResolvedValue(mockExportedKey);

      const result = await webCryptoAdapter.exportKey('spki', mockKey);

      expect(result).toBe(mockExportedKey);
      expect(mockSubtle.exportKey).toHaveBeenCalledWith('spki', mockKey);
    });
  });

  describe('deriveKey', () => {
    it('should derive key successfully', async () => {
      const mockBaseKey = {} as CryptoKey;
      const mockDerivedKey = {} as CryptoKey;
      const algorithm = {
        name: 'ECDH',
        public: {} as CryptoKey,
      } as EcdhKeyDeriveParams;
      const derivedKeyType = { name: 'AES-GCM', length: 256 };

      mockSubtle.deriveKey.mockResolvedValue(mockDerivedKey);

      const result = await webCryptoAdapter.deriveKey(
        algorithm,
        mockBaseKey,
        derivedKeyType as AesKeyGenParams,
        false,
        ['encrypt', 'decrypt'],
      );

      expect(result).toBe(mockDerivedKey);
      expect(mockSubtle.deriveKey).toHaveBeenCalledWith(
        algorithm,
        mockBaseKey,
        derivedKeyType,
        false,
        ['encrypt', 'decrypt'],
      );
    });
  });

  describe('deriveBits', () => {
    it('should derive bits successfully', async () => {
      const mockBaseKey = {} as CryptoKey;
      const mockDerivedBits = new ArrayBuffer(32);
      const algorithm = {
        name: 'ECDH',
        public: {} as CryptoKey,
      } as EcdhKeyDeriveParams;

      mockSubtle.deriveBits.mockResolvedValue(mockDerivedBits);

      const result = await webCryptoAdapter.deriveBits(
        algorithm,
        mockBaseKey,
        256,
      );

      expect(result).toBe(mockDerivedBits);
      expect(mockSubtle.deriveBits).toHaveBeenCalledWith(
        algorithm,
        mockBaseKey,
        256,
      );
    });
  });

  describe('getRandomValues', () => {
    it('should generate random values', () => {
      const mockArray = new Uint8Array(16);
      const mockFilledArray = new Uint8Array(16).fill(42);

      mockCrypto.getRandomValues.mockReturnValue(mockFilledArray);

      const result = webCryptoAdapter.getRandomValues(mockArray);

      expect(result).toBe(mockFilledArray);
      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(mockArray);
    });
  });
});
