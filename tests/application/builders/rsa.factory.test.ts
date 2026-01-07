/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { RSAFactory } from '../../../src/application/builders/rsa.factory';
import { RSABuilder } from '../../../src/application/builders/rsa.builder';
import { RSAContext } from '../../../src/application/context/rsa.context';

describe('RSAFactory', () => {
  let rsaFactory: RSAFactory;
  let mockContext: RSAContext;

  beforeEach(() => {
    mockContext = {
      _importKeyUseCase: {} as any,
      _encryptUseCase: {} as any,
      _decryptUseCase: {} as any,
      _signUseCase: {} as any,
      _verifyUseCase: {} as any,
      _exportKeyUseCase: {} as any,
      _generateKeyPairUseCase: {} as any,
    };

    rsaFactory = new RSAFactory(mockContext);
  });

  it('should be defined', () => {
    expect(rsaFactory).toBeDefined();
  });

  it('should create a new RSABuilder instance', () => {
    const builder = rsaFactory.builder();

    expect(builder).toBeInstanceOf(RSABuilder);
  });

  it('should create a new builder instance each time', () => {
    const builder1 = rsaFactory.builder();
    const builder2 = rsaFactory.builder();

    expect(builder1).not.toBe(builder2);
    expect(builder1).toBeInstanceOf(RSABuilder);
    expect(builder2).toBeInstanceOf(RSABuilder);
  });
});
