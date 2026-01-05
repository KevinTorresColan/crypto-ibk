import { ECCurve } from '../types/EC.types';

export const ECDSA_HASH_BY_CURVE: Record<ECCurve, AlgorithmIdentifier> = {
  [ECCurve.P256]: 'SHA-256',
  [ECCurve.P384]: 'SHA-384',
  [ECCurve.P521]: 'SHA-512',
};
