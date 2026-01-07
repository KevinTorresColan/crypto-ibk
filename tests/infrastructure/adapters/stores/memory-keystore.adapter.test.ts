import { describe, expect, it, beforeEach } from '@jest/globals';
import { MemoryKeyStore } from '../../../../src/infrastructure/adapters/store/memory-keystore.adapter';
import { KeysType } from '../../../../src/domain/types/client.type';

describe('MemoryKeyStore', () => {
  let keyStore: MemoryKeyStore;
  let mockKeysType: KeysType;

  beforeEach(() => {
    keyStore = MemoryKeyStore.getInstance();

    // Clear the store between tests by creating a new instance
    // Since it's a singleton, we need to clear the internal store
    const keys = ['testKey1', 'testKey2', 'testKey3'];
    keys.forEach((key) => {
      if (keyStore.has(key)) {
        keyStore.set(key, { privateKey: '', publicKey: '' });
      }
    });

    mockKeysType = {
      privateKey: 'mock-private-key-base64',
      publicKey: 'mock-public-key-base64',
    };
  });

  describe('getInstance', () => {
    it('should return a MemoryKeyStore instance', () => {
      expect(keyStore).toBeDefined();
      expect(keyStore).toBeInstanceOf(MemoryKeyStore);
    });

    it('should return the same instance (singleton pattern)', () => {
      const instance1 = MemoryKeyStore.getInstance();
      const instance2 = MemoryKeyStore.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should maintain state across getInstance calls', () => {
      const instance1 = MemoryKeyStore.getInstance();
      instance1.set('persistentKey', mockKeysType);

      const instance2 = MemoryKeyStore.getInstance();
      const retrieved = instance2.get('persistentKey');

      expect(retrieved).toEqual(mockKeysType);
    });
  });

  describe('set', () => {
    it('should store a key-value pair', () => {
      keyStore.set('testKey', mockKeysType);

      expect(keyStore.has('testKey')).toBe(true);
    });

    it('should store string keys', () => {
      const stringKeys: KeysType = {
        privateKey: 'private-key-string',
        publicKey: 'public-key-string',
      };

      keyStore.set('stringKey', stringKeys);

      expect(keyStore.get('stringKey')).toEqual(stringKeys);
    });

    it('should store ArrayBuffer keys', () => {
      const arrayBufferKeys: KeysType = {
        privateKey: new ArrayBuffer(32),
        publicKey: new ArrayBuffer(65),
      };

      keyStore.set('arrayBufferKey', arrayBufferKeys);

      expect(keyStore.get('arrayBufferKey')).toEqual(arrayBufferKeys);
    });

    it('should store CryptoKey keys', () => {
      const cryptoKeys: KeysType = {
        privateKey: {} as CryptoKey,
        publicKey: {} as CryptoKey,
      };

      keyStore.set('cryptoKey', cryptoKeys);

      expect(keyStore.get('cryptoKey')).toEqual(cryptoKeys);
    });

    it('should overwrite existing keys', () => {
      const firstValue: KeysType = {
        privateKey: 'first-private',
        publicKey: 'first-public',
      };

      const secondValue: KeysType = {
        privateKey: 'second-private',
        publicKey: 'second-public',
      };

      keyStore.set('overwriteKey', firstValue);
      keyStore.set('overwriteKey', secondValue);

      expect(keyStore.get('overwriteKey')).toEqual(secondValue);
    });
  });

  describe('get', () => {
    it('should retrieve a stored value', () => {
      keyStore.set('retrieveKey', mockKeysType);

      const result = keyStore.get('retrieveKey');

      expect(result).toEqual(mockKeysType);
    });

    it('should return undefined for non-existent key', () => {
      const result = keyStore.get('nonExistentKey');

      expect(result).toBeUndefined();
    });

    it('should retrieve the correct value among multiple keys', () => {
      const keys1: KeysType = { privateKey: 'priv1', publicKey: 'pub1' };
      const keys2: KeysType = { privateKey: 'priv2', publicKey: 'pub2' };
      const keys3: KeysType = { privateKey: 'priv3', publicKey: 'pub3' };

      keyStore.set('key1', keys1);
      keyStore.set('key2', keys2);
      keyStore.set('key3', keys3);

      expect(keyStore.get('key2')).toEqual(keys2);
    });

    it('should maintain key integrity after multiple operations', () => {
      keyStore.set('integrityKey', mockKeysType);
      keyStore.set('otherKey', { privateKey: 'other', publicKey: 'other' });

      const result = keyStore.get('integrityKey');

      expect(result).toEqual(mockKeysType);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      keyStore.set('existingKey', mockKeysType);

      expect(keyStore.has('existingKey')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(keyStore.has('nonExistentKey')).toBe(false);
    });

    it('should return true after setting a key', () => {
      expect(keyStore.has('newKey')).toBe(false);

      keyStore.set('newKey', mockKeysType);

      expect(keyStore.has('newKey')).toBe(true);
    });

    it('should handle multiple keys correctly', () => {
      keyStore.set('multiKey1', mockKeysType);
      keyStore.set('multiKey2', mockKeysType);

      expect(keyStore.has('multiKey1')).toBe(true);
      expect(keyStore.has('multiKey2')).toBe(true);
      expect(keyStore.has('multiKey3')).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete set-has-get workflow', () => {
      const key = 'workflowKey';
      const value: KeysType = {
        privateKey: 'workflow-private',
        publicKey: 'workflow-public',
      };

      expect(keyStore.has(key)).toBe(false);

      keyStore.set(key, value);

      expect(keyStore.has(key)).toBe(true);
      expect(keyStore.get(key)).toEqual(value);
    });

    it('should handle multiple concurrent keys', () => {
      const keys = [
        {
          name: 'alice',
          value: { privateKey: 'alice-priv', publicKey: 'alice-pub' },
        },
        {
          name: 'bob',
          value: { privateKey: 'bob-priv', publicKey: 'bob-pub' },
        },
        {
          name: 'charlie',
          value: { privateKey: 'charlie-priv', publicKey: 'charlie-pub' },
        },
      ];

      keys.forEach(({ name, value }) => {
        keyStore.set(name, value);
      });

      keys.forEach(({ name, value }) => {
        expect(keyStore.has(name)).toBe(true);
        expect(keyStore.get(name)).toEqual(value);
      });
    });

    it('should handle key updates correctly', () => {
      const key = 'updateKey';
      const initialValue: KeysType = {
        privateKey: 'initial-private',
        publicKey: 'initial-public',
      };
      const updatedValue: KeysType = {
        privateKey: 'updated-private',
        publicKey: 'updated-public',
      };

      keyStore.set(key, initialValue);
      expect(keyStore.get(key)).toEqual(initialValue);

      keyStore.set(key, updatedValue);
      expect(keyStore.get(key)).toEqual(updatedValue);
    });

    it('should handle mixed key types', () => {
      const stringKey: KeysType = { privateKey: 'string', publicKey: 'string' };
      const bufferKey: KeysType = {
        privateKey: new ArrayBuffer(16),
        publicKey: new ArrayBuffer(32),
      };
      const cryptoKey: KeysType = {
        privateKey: {} as CryptoKey,
        publicKey: {} as CryptoKey,
      };

      keyStore.set('string', stringKey);
      keyStore.set('buffer', bufferKey);
      keyStore.set('crypto', cryptoKey);

      expect(keyStore.get('string')).toEqual(stringKey);
      expect(keyStore.get('buffer')).toEqual(bufferKey);
      expect(keyStore.get('crypto')).toEqual(cryptoKey);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string as key', () => {
      keyStore.set('', mockKeysType);

      expect(keyStore.has('')).toBe(true);
      expect(keyStore.get('')).toEqual(mockKeysType);
    });

    it('should handle special characters in key names', () => {
      const specialKey = 'key-with-special_chars.123@#$';
      keyStore.set(specialKey, mockKeysType);

      expect(keyStore.has(specialKey)).toBe(true);
      expect(keyStore.get(specialKey)).toEqual(mockKeysType);
    });

    it('should handle very long key names', () => {
      const longKey = 'a'.repeat(1000);
      keyStore.set(longKey, mockKeysType);

      expect(keyStore.has(longKey)).toBe(true);
      expect(keyStore.get(longKey)).toEqual(mockKeysType);
    });

    it('should distinguish between similar key names', () => {
      const value1: KeysType = { privateKey: 'value1', publicKey: 'value1' };
      const value2: KeysType = { privateKey: 'value2', publicKey: 'value2' };

      keyStore.set('key', value1);
      keyStore.set('key1', value2);

      expect(keyStore.get('key')).toEqual(value1);
      expect(keyStore.get('key1')).toEqual(value2);
    });
  });
});
