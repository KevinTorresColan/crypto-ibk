import { ECCurve } from '../types/EC.types';

export const HMAC_KEY_LENGTH_BITS: Record<ECCurve, number> = {
  [ECCurve.P256]: 256,
  [ECCurve.P384]: 384,
  [ECCurve.P521]: 512,
};
