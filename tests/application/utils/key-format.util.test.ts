import { describe, it, expect } from '@jest/globals';
import {
  isPEM,
  isDERBase64,
  pemToArrayBuffer,
  arrayBufferToPem,
  derToBinary,
  transformKeyFormat,
} from '../../../src/application/utils/key-format.util';

describe('Key Format Utils', () => {
  describe('isPEM', () => {
    it('should return true for PEM formatted key', () => {
      const pemKey =
        '-----BEGIN PUBLIC KEY-----\nMIIBIjANBg==\n-----END PUBLIC KEY-----';
      expect(isPEM(pemKey)).toBe(true);
    });

    it('should return false for non-PEM key', () => {
      const base64Key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg==';
      expect(isPEM(base64Key)).toBe(false);
    });
  });

  describe('isDERBase64', () => {
    it('should return true for valid DER Base64', () => {
      const derKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg==';
      expect(isDERBase64(derKey)).toBe(true);
    });

    it('should return false for PEM key', () => {
      const pemKey =
        '-----BEGIN PUBLIC KEY-----\nMIIBIjANBg==\n-----END PUBLIC KEY-----';
      expect(isDERBase64(pemKey)).toBe(false);
    });

    it('should return false for invalid Base64', () => {
      const invalidKey = 'not-valid-base64!@#$';
      expect(isDERBase64(invalidKey)).toBe(false);
    });
  });

  describe('pemToArrayBuffer', () => {
    it('should convert PEM to ArrayBuffer', () => {
      const pemKey =
        '-----BEGIN PUBLIC KEY-----\nSGVsbG9Xb3JsZA==\n-----END PUBLIC KEY-----';
      const result = pemToArrayBuffer(pemKey);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should extract base64 content from PEM', () => {
      const base64Content = 'SGVsbG9Xb3JsZA==';
      const pemKey = `-----BEGIN PUBLIC KEY-----\n${base64Content}\n-----END PUBLIC KEY-----`;
      const result = pemToArrayBuffer(pemKey);

      expect(result).toBeInstanceOf(ArrayBuffer);
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe('HelloWorld');
    });
  });

  describe('arrayBufferToPem', () => {
    it('should convert ArrayBuffer to PEM format', () => {
      const data = new TextEncoder().encode('HelloWorld');
      const result = arrayBufferToPem(data.buffer, 'PUBLIC KEY');

      expect(result).toContain('-----BEGIN PUBLIC KEY-----');
      expect(result).toContain('-----END PUBLIC KEY-----');
    });

    it('should chunk base64 content into 64-character lines', () => {
      const largeData = new Uint8Array(100).fill(65);
      const result = arrayBufferToPem(largeData.buffer, 'PRIVATE KEY');

      const lines = result
        .split('\n')
        .filter(
          (line) =>
            !line.includes('BEGIN') && !line.includes('END') && line.length > 0,
        );

      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(64);
      });
    });
  });

  describe('derToBinary', () => {
    it('should convert DER Base64 to ArrayBuffer', () => {
      const derBase64 = btoa('HelloWorld');
      const result = derToBinary(derBase64);

      expect(result).toBeInstanceOf(ArrayBuffer);
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe('HelloWorld');
    });
  });

  describe('transformKeyFormat', () => {
    it('should transform PEM key to ArrayBuffer', () => {
      const pemKey =
        '-----BEGIN PUBLIC KEY-----\nSGVsbG9Xb3JsZA==\n-----END PUBLIC KEY-----';
      const result = transformKeyFormat(pemKey);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should transform DER Base64 to ArrayBuffer', () => {
      const derKey = btoa('HelloWorld');
      const result = transformKeyFormat(derKey);

      expect(result).toBeInstanceOf(ArrayBuffer);
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe('HelloWorld');
    });

    it('should throw error for unknown format', () => {
      const invalidKey = 'not-valid-format!@#$';
      expect(() => transformKeyFormat(invalidKey)).toThrow(
        'Unknown key format. Expected PEM or DER Base64.',
      );
    });
  });
});
