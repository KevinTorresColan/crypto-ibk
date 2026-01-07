/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ECCipherBuilder } from '../../../src/application/builders/ec-cipher.builder';
import { ECCipherContext } from '../../../src/application/context/ec-cipher.context';
import { ECCurve, CipherSuite } from '../../../src/domain/types/EC.types';
import { Mode, SignMode } from '../../../src/domain/types/client.type';
import { HMACMode } from '../../../src/domain/types/hmac.types';

describe('ECCipherBuilder', () => {
  let ecCipherBuilder: ECCipherBuilder;
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

    ecCipherBuilder = new ECCipherBuilder(mockContext);
  });

  it('should be defined', () => {
    expect(ecCipherBuilder).toBeDefined();
  });

  describe('withCurve', () => {
    it('should set curve and return builder instance', () => {
      const result = ecCipherBuilder.withCurve(ECCurve.P384);

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('withCipherSuite', () => {
    it('should set cipher suite and return builder instance', () => {
      const result = ecCipherBuilder.withCipherSuite(
        CipherSuite.AES_128_GCM_SHA256,
      );

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('withMode', () => {
    it('should set mode and return builder instance', () => {
      const result = ecCipherBuilder.withMode(Mode.ENCRYPT);

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('withSignMode', () => {
    it('should set sign mode and return builder instance', () => {
      const result = ecCipherBuilder.withSignMode(SignMode.SIGN);

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('withHMac', () => {
    it('should set HMAC mode and return builder instance', () => {
      const result = ecCipherBuilder.withHMac(HMACMode.ENABLE);

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('withRemotePublicKey', () => {
    it('should accept string key and return builder instance', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      const result = await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('withRemoteSignaturePublicKey', () => {
    it('should accept string key and return builder instance', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      const result =
        await ecCipherBuilder.withRemoteSignaturePublicKey(mockKeyString);

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('withRemoteHmacKey', () => {
    it('should accept string key and return builder instance', async () => {
      const mockKeyString = 'my-hmac-secret-key';

      const result = await ecCipherBuilder.withRemoteHmacKey(mockKeyString);

      expect(result).toBe(ecCipherBuilder);
    });

    it('should accept CryptoKey instance and return builder instance', async () => {
      const mockCryptoKey = {} as CryptoKey;

      const result = await ecCipherBuilder.withRemoteHmacKey(mockCryptoKey);

      expect(result).toBe(ecCipherBuilder);
    });
  });

  describe('getPublicKey', () => {
    it('should generate key pair and return public key as base64', async () => {
      const result = await ecCipherBuilder.getPublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should reuse existing key pair if already generated', async () => {
      const firstKey = await ecCipherBuilder.getPublicKey();
      const secondKey = await ecCipherBuilder.getPublicKey();

      expect(firstKey).toBe(secondKey);
    });

    it('should regenerate key pair when curve changes', async () => {
      await ecCipherBuilder.getPublicKey();

      ecCipherBuilder.withCurve(ECCurve.P384);
      const result = await ecCipherBuilder.getPublicKey();

      expect(typeof result).toBe('string');
    });
  });

  describe('getSignaturePublicKey', () => {
    it('should throw error when sign mode is not set', async () => {
      await expect(ecCipherBuilder.getSignaturePublicKey()).rejects.toThrow(
        'Sign mode is not SIGN, no signature key available',
      );
    });

    it('should generate signature key pair and return public key', async () => {
      ecCipherBuilder.withSignMode(SignMode.SIGN);

      const result = await ecCipherBuilder.getSignaturePublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getHMacKey', () => {
    it('should throw error when HMAC mode is not enabled', async () => {
      await expect(ecCipherBuilder.getHMacKey()).rejects.toThrow(
        'HMAC mode is not ENABLE, no HMAC key available',
      );
    });

    it('should generate HMAC key and return it as base64', async () => {
      ecCipherBuilder.withHMac(HMACMode.ENABLE);

      const result = await ecCipherBuilder.getHMacKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('build', () => {
    it('should throw error when remote public key is not set for encryption mode', async () => {
      ecCipherBuilder.withMode(Mode.ENCRYPT);

      await expect(ecCipherBuilder.build()).rejects.toThrow(
        'Remote public key not set',
      );
    });

    it('should throw error when remote public key is not set for decryption mode', async () => {
      ecCipherBuilder.withMode(Mode.DECRYPT);

      await expect(ecCipherBuilder.build()).rejects.toThrow(
        'Remote public key not set',
      );
    });

    it('should build service successfully with encryption mode', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      ecCipherBuilder.withMode(Mode.ENCRYPT);
      await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await ecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service successfully with decryption mode', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      ecCipherBuilder.withMode(Mode.DECRYPT);
      await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await ecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with sign mode enabled', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      ecCipherBuilder.withMode(Mode.ENCRYPT).withSignMode(SignMode.SIGN);
      await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await ecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with HMAC enabled', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      ecCipherBuilder.withMode(Mode.ENCRYPT).withHMac(HMACMode.ENABLE);
      await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await ecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with custom curve', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      ecCipherBuilder.withCurve(ECCurve.P384).withMode(Mode.ENCRYPT);
      await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await ecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with custom cipher suite', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      ecCipherBuilder
        .withCipherSuite(CipherSuite.AES_128_GCM_SHA256)
        .withMode(Mode.ENCRYPT);
      await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await ecCipherBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with all features enabled', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      ecCipherBuilder
        .withCurve(ECCurve.P521)
        .withCipherSuite(CipherSuite.AES_128_GCM_SHA256)
        .withMode(Mode.ENCRYPT)
        .withSignMode(SignMode.SIGN)
        .withHMac(HMACMode.ENABLE);
      await ecCipherBuilder.withRemotePublicKey(mockKeyString);

      const service = await ecCipherBuilder.build();

      expect(service).toBeDefined();
    });
  });
});
