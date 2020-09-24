import { createTest } from './helper';

describe('rollup-simple-configer', () => {
  it('build cjs cli', () => {
    const test = createTest(
      'src/cli.ts',
      {
        banner: `#!/usr/bin/env node`,
        file: 'bin/index.js',
        format: 'cjs',
      },
      { external: ['packageA', 'packageB'] }
    );
    expect(test.result).toBe(test.expect);
  });

  it('build cjs & esm lib', () => {
    const test = createTest('src/index.ts', [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
      },
      {
        file: 'dist/esm/index.js',
        format: 'esm',
      },
    ]);
    expect(test.result).toBe(test.expect);
  });

  it('build umd lib, withMin = true', () => {
    const test = createTest(
      'src/index.ts',
      {
        file: 'dist/umd/index.js',
        format: 'umd',
        name: 'awesome',
      },
      { withMin: true, resolveOnly: ['pichu', 'custom-defaults'] }
    );
    expect(test.result).toBe(test.expect);
  });

  it('build output = {}, withMin = true', () => {
    const test = createTest('src/cli.ts', {}, { withMin: true });
    expect(test.result).toBe(test.expect);
  });
});
