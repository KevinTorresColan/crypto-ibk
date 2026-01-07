/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ECCipherFactory } from '../../../src/application/builders/ec-cipher.factory';
import { ECCipherBuilder } from '../../../src/application/builders/ec-cipher.builder';
import { ECCipherContext } from '../../../src/application/context/ec-cipher.context';

describe('ECCipherFactory', () => {
  let ecCipherFactory: ECCipherFactory;
  let mockContext: ECCipherContext;

  beforeEach(() => {
    mockContext = {
      _importKeyUseCase: {} as any,
      _exportKeyUseCase: {} as any,
      _generateKeyPairUseCase: {} as any,
      _deriveBitsUseCase: {} as any,
      _digestUseCase: {} as any,
      _encryptUseCase: {} as any,
      _decryptUseCase: {} as any,
      _getRandomUseCase: {} as any,
      _signUseCase: {} as any,
      _verifyUseCase: {} as any,
    };

    ecCipherFactory = new ECCipherFactory(mockContext);
  });

  it('should be defined', () => {
    expect(ecCipherFactory).toBeDefined();
  });

  it('should create a new ECCipherBuilder instance', () => {
    const builder = ecCipherFactory.builder();

    expect(builder).toBeInstanceOf(ECCipherBuilder);
  });

  it('should create a new builder instance each time', () => {
    const builder1 = ecCipherFactory.builder();
    const builder2 = ecCipherFactory.builder();

    expect(builder1).not.toBe(builder2);
    expect(builder1).toBeInstanceOf(ECCipherBuilder);
    expect(builder2).toBeInstanceOf(ECCipherBuilder);
  });
});
