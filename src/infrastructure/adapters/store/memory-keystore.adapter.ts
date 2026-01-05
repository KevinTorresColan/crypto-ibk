import { KeysType } from '../../../domain/types/client.type';
import { KeyStoreRepository } from '../../../domain/repository/key-store.repository';

export class MemoryKeyStore implements KeyStoreRepository {
  private static instance: MemoryKeyStore;
  private store: Map<string, KeysType> = new Map();

  private constructor() {}

  static getInstance(): MemoryKeyStore {
    if (!MemoryKeyStore.instance) {
      MemoryKeyStore.instance = new MemoryKeyStore();
    }
    return MemoryKeyStore.instance;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  get(key: string): KeysType | undefined {
    return this.store.get(key);
  }

  set(key: string, value: KeysType) {
    this.store.set(key, value);
  }
}
