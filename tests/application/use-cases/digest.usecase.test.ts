import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DigestUseCase } from '../../../src/application/use-cases/digest.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { DigestConfigECAndRSA } from '../../../src/domain/types/client.type';

describe('DigestUseCase', () => {
  let digestUseCase: DigestUseCase;
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

    digestUseCase = new DigestUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(digestUseCase).toBeDefined();
  });

  it('should compute digest successfully with SHA-256', async () => {
    const mockData = new TextEncoder().encode('test data');
    const mockHash = new ArrayBuffer(32);

    const config: DigestConfigECAndRSA = {
      algorithm: 'SHA-256',
      data: mockData,
    };

    mockCryptoRepository.digest.mockResolvedValue(mockHash);

    const result = await digestUseCase.execute(config);

    expect(result).toBe(mockHash);
    expect(mockCryptoRepository.digest).toHaveBeenCalledWith(
      config.algorithm,
      config.data,
    );
    expect(mockCryptoRepository.digest).toHaveBeenCalledTimes(1);
  });

  it('should compute digest successfully with SHA-512', async () => {
    const mockData = new TextEncoder().encode('test data');
    const mockHash = new ArrayBuffer(64);

    const config: DigestConfigECAndRSA = {
      algorithm: 'SHA-512',
      data: mockData,
    };

    mockCryptoRepository.digest.mockResolvedValue(mockHash);

    const result = await digestUseCase.execute(config);

    expect(result).toBe(mockHash);
    expect(mockCryptoRepository.digest).toHaveBeenCalledWith(
      'SHA-512',
      mockData,
    );
  });

  it('should propagate errors from repository', async () => {
    const mockData = new TextEncoder().encode('test data');
    const mockError = new Error('Digest computation failed');

    const config: DigestConfigECAndRSA = {
      algorithm: 'SHA-256',
      data: mockData,
    };

    mockCryptoRepository.digest.mockRejectedValue(mockError);

    await expect(digestUseCase.execute(config)).rejects.toThrow(
      'Digest computation failed',
    );
  });
});
