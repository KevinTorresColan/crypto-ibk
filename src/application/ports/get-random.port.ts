export interface GetRandomPort {
  /**
   * Generates random bytes.
   * @param length - Number of bytes to generate.
   * @returns A `Uint8Array` containing random bytes.
   */
  execute(length: number): Uint8Array<ArrayBuffer>;
}
