export interface KeyStoreRepository {
  has(key: string): boolean;
  get(key: string):
    | {
        privateKey: string | ArrayBuffer | CryptoKey;
        publicKey: string | ArrayBuffer | CryptoKey;
      }
    | undefined;
  set(
    key: string,
    value: {
      privateKey: string | ArrayBuffer;
      publicKey: string | ArrayBuffer;
    },
  ): void;
}
