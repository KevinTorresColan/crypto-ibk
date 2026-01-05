import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/composition-root/container/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  external: ['crypto', 'util', 'fs/promises', 'fs', 'path'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs.js' : '.esm.js',
    };
  },
});
