import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetRandomUseCase } from '../../../src/application/use-cases/get-random.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';

describe('GetRandomUseCase', () => {
  let getRandomUseCase: GetRandomUseCase;
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

    getRandomUseCase = new GetRandomUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(getRandomUseCase).toBeDefined();
  });

  it('should generate random bytes successfully', () => {
    const length = 16;

    mockCryptoRepository.getRandomValues.mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    });

    const result = getRandomUseCase.execute(length);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(length);
    expect(mockCryptoRepository.getRandomValues).toHaveBeenCalledTimes(1);
  });

  it('should return empty array for zero length', () => {
    const result = getRandomUseCase.execute(0);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
    expect(mockCryptoRepository.getRandomValues).not.toHaveBeenCalled();
  });

  it('should return empty array for negative length', () => {
    const result = getRandomUseCase.execute(-5);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
    expect(mockCryptoRepository.getRandomValues).not.toHaveBeenCalled();
  });
});
