import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { VerifyUseCase } from '../../../src/application/use-cases/verify.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { VerifyConfigECAndRSA } from '../../../src/domain/types/client.type';

describe('VerifyUseCase', () => {
  let verifyUseCase: VerifyUseCase;
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

    verifyUseCase = new VerifyUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(verifyUseCase).toBeDefined();
  });

  it('should verify signature successfully - valid signature', async () => {
    const mockKey = {} as CryptoKey;
    const mockData = new TextEncoder().encode('test data').buffer;
    const mockSignature = new ArrayBuffer(64);

    const config: VerifyConfigECAndRSA = {
      algorithm: { name: 'ECDSA', hash: 'SHA-256' },
      key: mockKey,
      signature: mockSignature,
      data: mockData,
    };

    mockCryptoRepository.verify.mockResolvedValue(true);

    const result = await verifyUseCase.execute(config);

    expect(result).toBe(true);
    expect(mockCryptoRepository.verify).toHaveBeenCalledWith(
      config.algorithm,
      config.key,
      config.signature,
      config.data,
    );
    expect(mockCryptoRepository.verify).toHaveBeenCalledTimes(1);
  });

  it('should verify signature successfully - invalid signature', async () => {
    const mockKey = {} as CryptoKey;
    const mockData = new TextEncoder().encode('test data').buffer;
    const mockSignature = new ArrayBuffer(64);

    const config: VerifyConfigECAndRSA = {
      algorithm: { name: 'ECDSA', hash: 'SHA-256' },
      key: mockKey,
      signature: mockSignature,
      data: mockData,
    };

    mockCryptoRepository.verify.mockResolvedValue(false);

    const result = await verifyUseCase.execute(config);

    expect(result).toBe(false);
  });

  it('should propagate errors from repository', async () => {
    const mockKey = {} as CryptoKey;
    const mockData = new TextEncoder().encode('test data').buffer;
    const mockSignature = new ArrayBuffer(64);
    const mockError = new Error('Verification failed');

    const config: VerifyConfigECAndRSA = {
      algorithm: { name: 'ECDSA', hash: 'SHA-256' },
      key: mockKey,
      signature: mockSignature,
      data: mockData,
    };

    mockCryptoRepository.verify.mockRejectedValue(mockError);

    await expect(verifyUseCase.execute(config)).rejects.toThrow(
      'Verification failed',
    );
  });
});
