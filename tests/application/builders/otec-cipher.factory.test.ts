/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { OTECCipherFactory } from '../../../src/application/builders/otec-cipher.factory';
import { OTECCipherBuilder } from '../../../src/application/builders/otec-cipher.builder';
import { ECCipherContext } from '../../../src/application/context/ec-cipher.context';

describe('OTECCipherFactory', () => {
  let otecCipherFactory: OTECCipherFactory;
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

    otecCipherFactory = new OTECCipherFactory(mockContext);
  });

  it('should be defined', () => {
    expect(otecCipherFactory).toBeDefined();
  });

  it('should create a new OTECCipherBuilder instance', () => {
    const builder = otecCipherFactory.builder();

    expect(builder).toBeInstanceOf(OTECCipherBuilder);
  });

  it('should create a new builder instance each time', () => {
    const builder1 = otecCipherFactory.builder();
    const builder2 = otecCipherFactory.builder();

    expect(builder1).not.toBe(builder2);
    expect(builder1).toBeInstanceOf(OTECCipherBuilder);
    expect(builder2).toBeInstanceOf(OTECCipherBuilder);
  });
});
