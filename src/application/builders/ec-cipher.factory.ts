import { ECCipherBuilder } from './ec-cipher.builder';
import { ECCipherContext } from '../context/ec-cipher.context';

export class ECCipherFactory {
  constructor(private readonly deps: ECCipherContext) {}

  builder(): ECCipherBuilder {
    return new ECCipherBuilder(this.deps);
  }
}
