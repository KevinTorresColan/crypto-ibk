import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ImportKeyUseCase } from '../../../src/application/use-cases/import-key.usecase';
import { CryptoRepository } from '../../../src/domain/repository/crypto.repository';
import { ImportKeyConfigECAndRSA } from '../../../src/domain/types/client.type';

describe('ImportKeyUseCase', () => {
  let importKeyUseCase: ImportKeyUseCase;
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

    importKeyUseCase = new ImportKeyUseCase(mockCryptoRepository);
  });

  it('should be defined', () => {
    expect(importKeyUseCase).toBeDefined();
  });

  it('should import key successfully from ArrayBuffer', async () => {
    const mockKeyData = new ArrayBuffer(32);
    const mockImportedKey = {} as CryptoKey;

    const config: ImportKeyConfigECAndRSA = {
      format: 'spki',
      algorithm: { name: 'ECDH', namedCurve: 'P-256' },
      isExtractable: false,
      keyUsages: new Set(['deriveKey']),
    };

    mockCryptoRepository.importKey.mockResolvedValue(mockImportedKey);

    const result = await importKeyUseCase.execute(mockKeyData, config);

    expect(result).toBe(mockImportedKey);
    expect(mockCryptoRepository.importKey).toHaveBeenCalledWith(
      'spki',
      mockKeyData,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveKey'],
    );
    expect(mockCryptoRepository.importKey).toHaveBeenCalledTimes(1);
  });

  it('should import key successfully from Uint8Array', async () => {
    const mockKeyData = new Uint8Array(32);
    const mockImportedKey = {} as CryptoKey;

    const config: ImportKeyConfigECAndRSA = {
      format: 'raw',
      algorithm: { name: 'AES-GCM', length: 256 },
      isExtractable: true,
      keyUsages: new Set(['encrypt', 'decrypt']),
    };

    mockCryptoRepository.importKey.mockResolvedValue(mockImportedKey);

    const result = await importKeyUseCase.execute(mockKeyData, config);

    expect(result).toBe(mockImportedKey);
    expect(mockCryptoRepository.importKey).toHaveBeenCalledWith(
      'raw',
      mockKeyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  });

  it('should propagate errors from repository', async () => {
    const mockKeyData = new ArrayBuffer(32);
    const mockError = new Error('Import failed');

    const config: ImportKeyConfigECAndRSA = {
      format: 'spki',
      algorithm: { name: 'ECDH', namedCurve: 'P-256' },
      isExtractable: false,
      keyUsages: new Set(['deriveKey']),
    };

    mockCryptoRepository.importKey.mockRejectedValue(mockError);

    await expect(importKeyUseCase.execute(mockKeyData, config)).rejects.toThrow(
      'Import failed',
    );
  });
});
