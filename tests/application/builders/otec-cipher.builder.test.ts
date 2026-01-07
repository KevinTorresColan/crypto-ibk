/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { OTECCipherBuilder } from '../../../src/application/builders/otec-cipher.builder';
import { ECCipherContext } from '../../../src/application/context/ec-cipher.context';
import { ECCurve, CipherSuite } from '../../../src/domain/types/EC.types';
import { Mode } from '../../../src/domain/types/client.type';

describe('OTECCipherBuilder', () => {
  let otecCipherBuilder: OTECCipherBuilder;
  let mockContext: ECCipherContext;

  beforeEach(() => {
    mockContext = {
      _importKeyUseCase: {
        execute: async () => ({}) as CryptoKey,
      } as any,
      _exportKeyUseCase: {
        execute: async () => new ArrayBuffer(32),
      } as any,
      _generateKeyPairUseCase: {
        execute: async () =>
          ({ publicKey: {}, privateKey: {} }) as CryptoKeyPair,
      } as any,
      _deriveBitsUseCase: {} as any,
      _digestUseCase: {} as any,
      _encryptUseCase: {} as any,
      _decryptUseCase: {} as any,
      _getRandomUseCase: {} as any,
      _signUseCase: {} as any,
      _verifyUseCase: {} as any,
    };

    otecCipherBuilder = new OTECCipherBuilder(mockContext);
  });

  it('should be defined', () => {
    expect(otecCipherBuilder).toBeDefined();
  });

  describe('withCurve', () => {
    it('should set curve and return builder instance', () => {
      const result = otecCipherBuilder.withCurve(ECCurve.P384);

      expect(result).toBe(otecCipherBuilder);
    });
  });

  describe('withCipherSuite', () => {
    it('should set cipher suite and return builder instance', () => {
      const result = otecCipherBuilder.withCipherSuite(
        CipherSuite.AES_128_GCM_SHA256,
      );

      expect(result).toBe(otecCipherBuilder);
    });
  });

  describe('withMode', () => {
    it('should set mode and return builder instance', () => {
      const result = otecCipherBuilder.withMode(Mode.ENCRYPT);

      expect(result).toBe(otecCipherBuilder);
    });
  });

  describe('withRemotePublicKey', () => {
    it('should accept string key and return builder instance', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      const result = await otecCipherBuilder.withRemotePublicKey(mockKeyString);

      expect(result).toBe(otecCipherBuilder);
    });
  });

  describe('getPublicKey', () => {
    it('should generate key pair and return public key as base64', async () => {
      const result = await otecCipherBuilder.getPublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should reuse existing key pair if already generated', async () => {
      const firstKey = await otecCipherBuilder.getPublicKey();
      const secondKey = await otecCipherBuilder.getPublicKey();

      expect(firstKey).toBe(secondKey);
    });

    it('should regenerate key pair when curve changes', async () => {
      await otecCipherBuilder.getPublicKey();

      otecCipherBuilder.withCurve(ECCurve.P384);
      const result = await otecCipherBuilder.getPublicKey();

      expect(typeof result).toBe('string');
    });
  });

  describe('build', () => {
    it('should throw error when remote public key is not set', async () => {
      await expect(otecCipherBuilder.build()).rejects.toThrow(
        'Remote public key not set',
      );
    });

    it('should throw error when builder already used', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      await otecCipherBuilder.withRemotePublicKey(mockKeyString);
      await otecCipherBuilder.build();

      await expect(otecCipherBuilder.build()).rejects.toThrow(
        'Builder already used',
      );
    });

    it('should build service successfully with default mode (DECRYPT)', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      await otecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await otecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service successfully with ENCRYPT mode', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      otecCipherBuilder.withMode(Mode.ENCRYPT);
      await otecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await otecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with custom curve', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      otecCipherBuilder.withCurve(ECCurve.P384);
      await otecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await otecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with custom cipher suite', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      otecCipherBuilder.withCipherSuite(CipherSuite.AES_128_GCM_SHA256);
      await otecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await otecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with all custom settings', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      otecCipherBuilder
        .withCurve(ECCurve.P521)
        .withCipherSuite(CipherSuite.AES_128_GCM_SHA256)
        .withMode(Mode.ENCRYPT);
      await otecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await otecCipherBuilder.build();

      expect(service).toBeDefined();
    });
  });
});
