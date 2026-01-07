import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CryptoApplication } from '../../src/application/crypto.application';
import { KeyStoreRepository } from '../../src/domain/repository/key-store.repository';
import { OTECCipherFactory } from '../../src/application/builders/otec-cipher.factory';
import { ECCipherFactory } from '../../src/application/builders/ec-cipher.factory';
import { RSAFactory } from '../../src/application/builders/rsa.factory';
import { KeysType } from '../../src/domain/types/client.type';

describe('CryptoApplication', () => {
  let cryptoApplication: CryptoApplication;
  let mockOTEC: jest.Mocked<OTECCipherFactory>;
  let mockEC: jest.Mocked<ECCipherFactory>;
  let mockRSA: jest.Mocked<RSAFactory>;
  let mockKeyStore: jest.Mocked<KeyStoreRepository>;

  beforeEach(() => {
    mockOTEC = {} as jest.Mocked<OTECCipherFactory>;
    mockEC = {} as jest.Mocked<ECCipherFactory>;
    mockRSA = {} as jest.Mocked<RSAFactory>;

    mockKeyStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      has: jest.fn(),
    } as unknown as jest.Mocked<KeyStoreRepository>;

    cryptoApplication = new CryptoApplication(
      mockOTEC,
      mockEC,
      mockRSA,
      mockKeyStore,
    );
  });

  it('should be defined', () => {
    expect(cryptoApplication).toBeDefined();
  });

  describe('RSA', () => {
    it('should return RSA factory', () => {
      const result = cryptoApplication.RSA();
      expect(result).toBe(mockRSA);
    });
  });

  describe('OTEC', () => {
    it('should return OTEC factory', () => {
      const result = cryptoApplication.OTEC();
      expect(result).toBe(mockOTEC);
    });
  });

  describe('EC', () => {
    it('should return EC factory', () => {
      const result = cryptoApplication.EC();
      expect(result).toBe(mockEC);
    });
  });

  describe('GetKey', () => {
    it('should retrieve key from key store', () => {
      const mockKey: KeysType = {
        publicKey: {} as CryptoKey,
        privateKey: {} as CryptoKey,
      };

      mockKeyStore.get.mockReturnValue(mockKey);

      const result = cryptoApplication.GetKey('test-key');

      expect(result).toBe(mockKey);
      expect(mockKeyStore.get).toHaveBeenCalledWith('test-key');
      expect(mockKeyStore.get).toHaveBeenCalledTimes(1);
    });

    it('should return undefined if key not found', () => {
      mockKeyStore.get.mockReturnValue(undefined);

      const result = cryptoApplication.GetKey('non-existent-key');

      expect(result).toBeUndefined();
      expect(mockKeyStore.get).toHaveBeenCalledWith('non-existent-key');
    });
  });
});
