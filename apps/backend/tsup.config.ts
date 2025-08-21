import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node22',
  clean: true,
  outDir: 'dist',
  sourcemap: true,
  external: ['@repo/shared'],
  dts: false,
  splitting: false,
  minify: !options.watch,
  onSuccess: options.watch ? 'node --no-warnings dist/index.js' : undefined,
}));
