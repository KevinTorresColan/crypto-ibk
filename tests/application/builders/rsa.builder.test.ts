/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { RSABuilder } from '../../../src/application/builders/rsa.builder';
import { RSAContext } from '../../../src/application/context/rsa.context';
import { Mode, SignMode } from '../../../src/domain/types/client.type';

describe('RSABuilder', () => {
  let rsaBuilder: RSABuilder;
  let mockContext: RSAContext;

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
      _encryptUseCase: {} as any,
      _decryptUseCase: {} as any,
      _signUseCase: {} as any,
      _verifyUseCase: {} as any,
    };

    rsaBuilder = new RSABuilder(mockContext);
  });

  it('should be defined', () => {
    expect(rsaBuilder).toBeDefined();
  });

  describe('withMode', () => {
    it('should set mode and return builder instance', () => {
      const result = rsaBuilder.withMode(Mode.ENCRYPT);

      expect(result).toBe(rsaBuilder);
    });
  });

  describe('withSignMode', () => {
    it('should set sign mode and return builder instance', () => {
      const result = rsaBuilder.withSignMode(SignMode.SIGN);

      expect(result).toBe(rsaBuilder);
    });
  });

  describe('withRemotePublicKey', () => {
    it('should accept string key and return builder instance', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      rsaBuilder.withMode(Mode.ENCRYPT);
      const result = await rsaBuilder.withRemotePublicKey(mockKeyString);

      expect(result).toBe(rsaBuilder);
    });
  });

  describe('withRemoteSignaturePublicKey', () => {
    it('should accept string key and return builder instance', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      const result =
        await rsaBuilder.withRemoteSignaturePublicKey(mockKeyString);

      expect(result).toBe(rsaBuilder);
    });
  });

  describe('getPublicKey', () => {
    it('should generate key pair and return public key as base64', async () => {
      const result = await rsaBuilder.getPublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should reuse existing key pair if already generated', async () => {
      const firstKey = await rsaBuilder.getPublicKey();
      const secondKey = await rsaBuilder.getPublicKey();

      expect(firstKey).toBe(secondKey);
    });
  });

  describe('getSignaturePublicKey', () => {
    it('should generate signature key pair and return public key', async () => {
      rsaBuilder.withSignMode(SignMode.SIGN);

      const result = await rsaBuilder.getSignaturePublicKey();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should reuse existing signature key pair if already generated', async () => {
      rsaBuilder.withSignMode(SignMode.SIGN);

      const firstKey = await rsaBuilder.getSignaturePublicKey();
      const secondKey = await rsaBuilder.getSignaturePublicKey();

      expect(firstKey).toBe(secondKey);
    });
  });

  describe('build', () => {
    it('should build service successfully with encryption mode', async () => {
      rsaBuilder.withMode(Mode.ENCRYPT);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service successfully with decryption mode', async () => {
      rsaBuilder.withMode(Mode.DECRYPT);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service successfully with sign mode', async () => {
      rsaBuilder.withSignMode(SignMode.SIGN);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service successfully with verify mode', async () => {
      rsaBuilder.withSignMode(SignMode.VERIFY);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with both encryption and sign modes', async () => {
      rsaBuilder.withMode(Mode.ENCRYPT).withSignMode(SignMode.SIGN);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with remote public key set', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      rsaBuilder.withMode(Mode.ENCRYPT);
      await rsaBuilder.withRemotePublicKey(mockKeyString);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with remote signature public key set', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      rsaBuilder.withSignMode(SignMode.VERIFY);
      await rsaBuilder.withRemoteSignaturePublicKey(mockKeyString);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });

    it('should build service with all configurations', async () => {
      const mockKeyString =
        '-----BEGIN PUBLIC KEY-----\nMock\n-----END PUBLIC KEY-----';

      rsaBuilder.withMode(Mode.ENCRYPT).withSignMode(SignMode.SIGN);
      await rsaBuilder.withRemotePublicKey(mockKeyString);
      await rsaBuilder.withRemoteSignaturePublicKey(mockKeyString);

      const service = await rsaBuilder.build();

      expect(service).toBeDefined();
    });
  });
});
