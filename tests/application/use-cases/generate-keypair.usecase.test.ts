import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GenerateKeyPairUseCase } from '../../../src/application/use-cases/generate-keypair.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { GenerateKeyConfigECAndRSA } from '../../../src/domain/types/client.type';

describe('GenerateKeyPairUseCase', () => {
  let generateKeyPairUseCase: GenerateKeyPairUseCase;
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

    generateKeyPairUseCase = new GenerateKeyPairUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(generateKeyPairUseCase).toBeDefined();
  });

  it('should generate key pair successfully', async () => {
    const mockKeyPair = {
      publicKey: {} as CryptoKey,
      privateKey: {} as CryptoKey,
    } as CryptoKeyPair;

    const config: GenerateKeyConfigECAndRSA = {
      algorithm: { name: 'ECDH', namedCurve: 'P-256' },
      isExtractable: true,
      keyUsages: ['deriveKey', 'deriveBits'],
    };

    mockCryptoRepository.generateKey.mockResolvedValue(mockKeyPair);

    const result = await generateKeyPairUseCase.execute(config);

    expect(result).toBe(mockKeyPair);
    expect(mockCryptoRepository.generateKey).toHaveBeenCalledWith(
      config.algorithm,
      config.isExtractable,
      Array.from(config.keyUsages),
    );
    expect(mockCryptoRepository.generateKey).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from repository', async () => {
    const mockError = new Error('Key generation failed');

    const config: GenerateKeyConfigECAndRSA = {
      algorithm: { name: 'ECDH', namedCurve: 'P-256' },
      isExtractable: true,
      keyUsages: ['deriveKey'],
    };

    mockCryptoRepository.generateKey.mockRejectedValue(mockError);

    await expect(generateKeyPairUseCase.execute(config)).rejects.toThrow(
      'Key generation failed',
    );
  });
});
