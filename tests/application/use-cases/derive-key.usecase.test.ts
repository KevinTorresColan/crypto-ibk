import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DeriveKeyUseCase } from '../../../src/application/use-cases/derive-key.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { DeriveKeyConfigECAndRSA } from '../../../src/domain/types/client.type';

describe('DeriveKeyUseCase', () => {
  let deriveKeyUseCase: DeriveKeyUseCase;
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

    deriveKeyUseCase = new DeriveKeyUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(deriveKeyUseCase).toBeDefined();
  });

  it('should derive key successfully', async () => {
    const mockBaseKey = {} as CryptoKey;
    const mockDerivedKey = {} as CryptoKey;

    const config: DeriveKeyConfigECAndRSA = {
      algorithm: {
        name: 'ECDH' as const,
        public: {} as CryptoKey,
      },
      baseKey: mockBaseKey,
      algorithmDerive: { name: 'AES-GCM', length: 256 },
      isExtractable: false,
      keyUsages: new Set(['encrypt', 'decrypt']),
    };

    mockCryptoRepository.deriveKey.mockResolvedValue(mockDerivedKey);

    const result = await deriveKeyUseCase.execute(config);

    expect(result).toBe(mockDerivedKey);
    expect(mockCryptoRepository.deriveKey).toHaveBeenCalledWith(
      config.algorithm,
      config.baseKey,
      config.algorithmDerive,
      config.isExtractable,
      ['encrypt', 'decrypt'],
    );
    expect(mockCryptoRepository.deriveKey).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from repository', async () => {
    const mockBaseKey = {} as CryptoKey;
    const mockError = new Error('Key derivation failed');

    const config: DeriveKeyConfigECAndRSA = {
      algorithm: {
        name: 'ECDH' as const,
        public: {} as CryptoKey,
      },
      baseKey: mockBaseKey,
      algorithmDerive: { name: 'AES-GCM', length: 256 },
      isExtractable: false,
      keyUsages: new Set(['encrypt']),
    };

    mockCryptoRepository.deriveKey.mockRejectedValue(mockError);

    await expect(deriveKeyUseCase.execute(config)).rejects.toThrow(
      'Key derivation failed',
    );
  });
});
