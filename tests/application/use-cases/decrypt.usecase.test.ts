import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DecryptUseCase } from '../../../src/application/use-cases/decrypt.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { DecryptConfig } from '../../../src/domain/types/client.type';

describe('DecryptUseCase', () => {
  let decryptUseCase: DecryptUseCase;
  let mockCryptoRepository: jest.Mocked<CryptoRepository>;

  beforeEach(() => {
    mockCryptoRepository = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
      deriveKey: jest.fn(),
      deriveBits: jest.fn(),
      digest: jest.fn(),
      getRandomValues: jest.fn(),
    } as unknown as jest.Mocked<CryptoRepository>;

    decryptUseCase = new DecryptUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(decryptUseCase).toBeDefined();
  });

  it('should decrypt data successfully', async () => {
    const mockKey = {} as CryptoKey;
    const mockEncryptedData = new ArrayBuffer(32);
    const mockDecrypted = new TextEncoder().encode('decrypted data').buffer;

    const config: DecryptConfig = {
      algorithm: { name: 'AES-GCM', iv: new Uint8Array(12) },
      key: mockKey,
      data: mockEncryptedData,
    };

    mockCryptoRepository.decrypt.mockResolvedValue(mockDecrypted);

    const result = await decryptUseCase.execute(config);

    expect(result).toBe(mockDecrypted);
    expect(mockCryptoRepository.decrypt).toHaveBeenCalledWith(
      config.algorithm,
      config.key,
      config.data,
    );
    expect(mockCryptoRepository.decrypt).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from repository', async () => {
    const mockKey = {} as CryptoKey;
    const mockEncryptedData = new ArrayBuffer(32);
    const mockError = new Error('Decryption failed');

    const config: DecryptConfig = {
      algorithm: { name: 'AES-GCM', iv: new Uint8Array(12) },
      key: mockKey,
      data: mockEncryptedData,
    };

    mockCryptoRepository.decrypt.mockRejectedValue(mockError);

    await expect(decryptUseCase.execute(config)).rejects.toThrow(
      'Decryption failed',
    );
  });
});
