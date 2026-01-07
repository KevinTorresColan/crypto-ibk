import { describe, it, expect } from '@jest/globals';
import {
  EncodeJsonToUint8Array,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToBase64Clean,
} from '../../../src/shared/utils/converter.util';

describe('Converter Utils', () => {
  describe('EncodeJsonToUint8Array', () => {
    it('should encode JSON object to Uint8Array', () => {
      const data = { name: 'test', value: 123 };
      const result = EncodeJsonToUint8Array(data);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);

      const decoded = JSON.parse(new TextDecoder().decode(result));
      expect(decoded).toEqual(data);
    });

    it('should encode empty object', () => {
      const data = {};
      const result = EncodeJsonToUint8Array(data);

      expect(result).toBeInstanceOf(Uint8Array);
      const decoded = JSON.parse(new TextDecoder().decode(result));
      expect(decoded).toEqual({});
    });

    it('should encode array', () => {
      const data = [1, 2, 3, 4];
      const result = EncodeJsonToUint8Array(data);

      expect(result).toBeInstanceOf(Uint8Array);
      const decoded = JSON.parse(new TextDecoder().decode(result));
      expect(decoded).toEqual([1, 2, 3, 4]);
    });
  });

  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to Base64', () => {
      const data = new TextEncoder().encode('hello world');
      const result = arrayBufferToBase64(data.buffer);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should convert empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = arrayBufferToBase64(buffer);

      expect(result).toBe('');
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('should convert Base64 to ArrayBuffer', () => {
      const original = 'hello world';
      const encoded = btoa(original);
      const result = base64ToArrayBuffer(encoded);

      expect(result).toBeInstanceOf(ArrayBuffer);
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(original);
    });

    it('should handle round trip conversion', () => {
      const originalData = new TextEncoder().encode('test data 12345');
      const base64 = arrayBufferToBase64(originalData.buffer);
      const decoded = base64ToArrayBuffer(base64);

      expect(new Uint8Array(decoded)).toEqual(originalData);
    });
  });

  describe('arrayBufferToBase64Clean', () => {
    it('should convert ArrayBuffer to Base64 without line breaks', () => {
      const data = new TextEncoder().encode('hello world from testing');
      const result = arrayBufferToBase64Clean(data.buffer);

      expect(typeof result).toBe('string');
      expect(result).not.toContain('\n');
    });

    it('should produce same result as arrayBufferToBase64 without newlines', () => {
      const data = new TextEncoder().encode('test');
      const clean = arrayBufferToBase64Clean(data.buffer);
      const normal = arrayBufferToBase64(data.buffer).replaceAll('\n', '');

      expect(clean).toBe(normal);
    });
  });
});
