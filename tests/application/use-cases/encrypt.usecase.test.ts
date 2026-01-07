import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EncryptUseCase } from '../../../src/application/use-cases/encrypt.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { EncryptConfig } from '../../../src/domain/types/client.type';

describe('EncryptUseCase', () => {
  let encryptUseCase: EncryptUseCase;
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

    encryptUseCase = new EncryptUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(encryptUseCase).toBeDefined();
  });

  it('should encrypt data successfully', async () => {
    const mockKey = {} as CryptoKey;
    const mockData = new TextEncoder().encode('test data');
    const mockEncrypted = new ArrayBuffer(16);

    const config: EncryptConfig = {
      algorithm: { name: 'AES-GCM', iv: new Uint8Array(12) },
      key: mockKey,
      data: mockData,
    };

    mockCryptoRepository.encrypt.mockResolvedValue(mockEncrypted);

    const result = await encryptUseCase.execute(config);

    expect(result).toBe(mockEncrypted);
    expect(mockCryptoRepository.encrypt).toHaveBeenCalledWith(
      config.algorithm,
      config.key,
      config.data,
    );
    expect(mockCryptoRepository.encrypt).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from repository', async () => {
    const mockKey = {} as CryptoKey;
    const mockData = new TextEncoder().encode('test data');
    const mockError = new Error('Encryption failed');

    const config: EncryptConfig = {
      algorithm: { name: 'AES-GCM', iv: new Uint8Array(12) },
      key: mockKey,
      data: mockData,
    };

    mockCryptoRepository.encrypt.mockRejectedValue(mockError);

    await expect(encryptUseCase.execute(config)).rejects.toThrow(
      'Encryption failed',
    );
  });
});
