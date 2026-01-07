import { describe, expect, it } from '@jest/globals';
import {
  CryptoClient,
  Mode,
  SignMode,
  CipherSuite,
  ECCurve,
  HMACMode,
} from '../../../src/composition-root/container/crypto.container';

describe('CryptoContainer', () => {
  describe('CryptoClient', () => {
    it('should export CryptoClient instance', () => {
      expect(CryptoClient).toBeDefined();
      expect(CryptoClient).toHaveProperty('OTEC');
      expect(CryptoClient).toHaveProperty('EC');
      expect(CryptoClient).toHaveProperty('RSA');
    });

    it('should have OTEC method', () => {
      expect(typeof CryptoClient.OTEC).toBe('function');
    });

    it('should have EC method', () => {
      expect(typeof CryptoClient.EC).toBe('function');
    });

    it('should have RSA method', () => {
      expect(typeof CryptoClient.RSA).toBe('function');
    });

    it('should have GetKey method', () => {
      expect(typeof CryptoClient.GetKey).toBe('function');
    });
  });

  describe('Exported Types - Mode', () => {
    it('should export Mode enum', () => {
      expect(Mode).toBeDefined();
    });

    it('should have ENCRYPT mode', () => {
      expect(Mode.ENCRYPT).toBe('encrypt');
    });

    it('should have DECRYPT mode', () => {
      expect(Mode.DECRYPT).toBe('decrypt');
    });
  });

  describe('Exported Types - SignMode', () => {
    it('should export SignMode enum', () => {
      expect(SignMode).toBeDefined();
    });

    it('should have SIGN mode', () => {
      expect(SignMode.SIGN).toBe('sign');
    });

    it('should have VERIFY mode', () => {
      expect(SignMode.VERIFY).toBe('verify');
    });
  });

  describe('Exported Types - CipherSuite', () => {
    it('should export CipherSuite enum', () => {
      expect(CipherSuite).toBeDefined();
    });

    it('should have AES_256_GCM_SHA256', () => {
      expect(CipherSuite.AES_256_GCM_SHA256).toBe('AES_256_GCM_SHA256');
    });

    it('should have AES_192_GCM_SHA256', () => {
      expect(CipherSuite.AES_192_GCM_SHA256).toBe('AES_192_GCM_SHA256');
    });

    it('should have AES_128_GCM_SHA256', () => {
      expect(CipherSuite.AES_128_GCM_SHA256).toBe('AES_128_GCM_SHA256');
    });

    it('should have AES_256_GCM_SHA384', () => {
      expect(CipherSuite.AES_256_GCM_SHA384).toBe('AES_256_GCM_SHA384');
    });
  });

  describe('Exported Types - ECCurve', () => {
    it('should export ECCurve enum', () => {
      expect(ECCurve).toBeDefined();
    });

    it('should have P256 curve', () => {
      expect(ECCurve.P256).toBe('P-256');
    });

    it('should have P384 curve', () => {
      expect(ECCurve.P384).toBe('P-384');
    });

    it('should have P521 curve', () => {
      expect(ECCurve.P521).toBe('P-521');
    });
  });

  describe('Exported Types - HMACMode', () => {
    it('should export HMACMode enum', () => {
      expect(HMACMode).toBeDefined();
    });

    it('should have ENABLE mode', () => {
      expect(HMACMode.ENABLE).toBe('enable');
    });
  });

  describe('OTEC Builder', () => {
    it('should return factory from OTEC method', () => {
      const factory = CryptoClient.OTEC();

      expect(factory).toBeDefined();
      expect(factory).toHaveProperty('builder');
      expect(typeof factory.builder).toBe('function');
    });
  });

  describe('EC Builder', () => {
    it('should return factory from EC method', () => {
      const factory = CryptoClient.EC();

      expect(factory).toBeDefined();
      expect(factory).toHaveProperty('builder');
      expect(typeof factory.builder).toBe('function');
    });
  });

  describe('RSA Builder', () => {
    it('should return factory from RSA method', () => {
      const factory = CryptoClient.RSA();

      expect(factory).toBeDefined();
      expect(factory).toHaveProperty('builder');
      expect(typeof factory.builder).toBe('function');
    });
  });

  describe('Integration - OTEC', () => {
    it('should create OTEC service with builder', async () => {
      const factory = CryptoClient.OTEC();
      const builder = factory.builder();
      builder.withCurve(ECCurve.P256);
      builder.withCipherSuite(CipherSuite.AES_128_GCM_SHA256);
      builder.withMode(Mode.ENCRYPT);

      const publicKey = await builder.getPublicKey();

      expect(publicKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
    });
  });

  describe('Integration - EC', () => {
    it('should create EC service with builder', async () => {
      const factory = CryptoClient.EC();
      const builder = factory.builder();
      builder.withCurve(ECCurve.P256);
      builder.withCipherSuite(CipherSuite.AES_128_GCM_SHA256);
      builder.withMode(Mode.ENCRYPT);

      const publicKey = await builder.getPublicKey();

      expect(publicKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
    });
  });

  describe('Integration - RSA', () => {
    it('should create RSA service with builder', async () => {
      const factory = CryptoClient.RSA();
      const builder = factory.builder();
      builder.withMode(Mode.ENCRYPT);

      const publicKey = await builder.getPublicKey();

      expect(publicKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
    });
  });

  describe('Container Singleton Behavior', () => {
    it('should return same CryptoClient instance', () => {
      const client1 = CryptoClient;
      const client2 = CryptoClient;

      expect(client1).toBe(client2);
    });

    it('should return same OTEC factory instance', () => {
      const factory1 = CryptoClient.OTEC();
      const factory2 = CryptoClient.OTEC();

      expect(factory1).toBe(factory2);
    });

    it('should return same EC factory instance', () => {
      const factory1 = CryptoClient.EC();
      const factory2 = CryptoClient.EC();

      expect(factory1).toBe(factory2);
    });

    it('should return same RSA factory instance', () => {
      const factory1 = CryptoClient.RSA();
      const factory2 = CryptoClient.RSA();

      expect(factory1).toBe(factory2);
    });

    it('should create independent builders from same factory', () => {
      const factory = CryptoClient.OTEC();
      const builder1 = factory.builder();
      const builder2 = factory.builder();

      expect(builder1).not.toBe(builder2);
    });
  });
});
