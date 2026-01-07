import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SignUseCase } from '../../../src/application/use-cases/sign.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { SignConfigECAndRSA } from '../../../src/domain/types/client.type';

describe('SignUseCase', () => {
  let signUseCase: SignUseCase;
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

    signUseCase = new SignUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(signUseCase).toBeDefined();
  });

  it('should sign data successfully', async () => {
    const mockKey = {} as CryptoKey;
    const mockData = new TextEncoder().encode('test data');
    const mockSignature = new ArrayBuffer(64);

    const config: SignConfigECAndRSA = {
      algorithm: { name: 'ECDSA', hash: 'SHA-256' },
      key: mockKey,
      data: mockData.buffer,
    };

    mockCryptoRepository.sign.mockResolvedValue(mockSignature);

    const result = await signUseCase.execute(config);

    expect(result).toBe(mockSignature);
    expect(mockCryptoRepository.sign).toHaveBeenCalledWith(
      config.algorithm,
      config.key,
      config.data,
    );
    expect(mockCryptoRepository.sign).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from repository', async () => {
    const mockKey = {} as CryptoKey;
    const mockData = new TextEncoder().encode('test data').buffer;
    const mockError = new Error('Signing failed');

    const config: SignConfigECAndRSA = {
      algorithm: { name: 'ECDSA', hash: 'SHA-256' },
      key: mockKey,
      data: mockData,
    };

    mockCryptoRepository.sign.mockRejectedValue(mockError);

    await expect(signUseCase.execute(config)).rejects.toThrow('Signing failed');
  });
});
