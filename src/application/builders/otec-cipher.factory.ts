import { OTECCipherBuilder } from './otec-cipher.builder';
import { ECCipherContext } from '../context/ec-cipher.context';

export class OTECCipherFactory {
  constructor(private readonly deps: ECCipherContext) {}

  builder(): OTECCipherBuilder {
    return new OTECCipherBuilder(this.deps);
  }
}
