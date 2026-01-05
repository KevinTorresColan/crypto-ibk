import { RSAContext } from '../context/rsa.context';
import { RSABuilder } from './rsa.builder';

export class RSAFactory {
  constructor(private readonly deps: RSAContext) {}

  builder(): RSABuilder {
    return new RSABuilder(this.deps);
  }
}
