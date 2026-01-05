import { CipherSuite, CipherSuiteConfig } from '../types/EC.types';

export const CIPHER_SUITE_CONFIGS: Record<CipherSuite, CipherSuiteConfig> = {
  [CipherSuite.AES_256_GCM_SHA256]: {
    algorithm: 'AES-GCM',
    keySizeBits: 256,
    hashAlgorithm: 'SHA-256',
    keySizeBytes: 32,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
  [CipherSuite.AES_192_GCM_SHA256]: {
    algorithm: 'AES-GCM',
    keySizeBits: 192,
    hashAlgorithm: 'SHA-256',
    keySizeBytes: 24,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
  [CipherSuite.AES_128_GCM_SHA256]: {
    algorithm: 'AES-GCM',
    keySizeBits: 128,
    hashAlgorithm: 'SHA-256',
    keySizeBytes: 16,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
  [CipherSuite.AES_256_GCM_SHA384]: {
    algorithm: 'AES-GCM',
    keySizeBits: 256,
    hashAlgorithm: 'SHA-384',
    keySizeBytes: 32,
    tagLengthBits: 128,
    ivLengthBytes: 12,
  },
};
