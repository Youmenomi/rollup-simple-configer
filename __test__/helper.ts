import { build, OtherOptions, BuildOptions } from '../src';
import { OutputOptions } from 'rollup';
import filesize from 'rollup-plugin-filesize';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import { defaults } from 'custom-defaults';

const defOtherOptions = {
  external: undefined,
  withMin: false,
  resolveOnly: [],
};

export function createTest(
  input: string,
  output: OutputOptions | OutputOptions[],
  otherOptions?: OtherOptions
) {
  const { external, withMin, resolveOnly } = defaults(
    otherOptions,
    defOtherOptions
  );
  let expect: BuildOptions | BuildOptions[];
  if (withMin) {
    expect = [
      {
        input,
        external,
        plugins: getPlugins(false, resolveOnly),
        output: outputs(output),
      },
      {
        input,
        external,
        plugins: getPlugins(true, resolveOnly),
        output: outputs(output, true),
      },
    ];
  } else {
    expect = {
      input,
      external,
      plugins: getPlugins(false, resolveOnly),
      output: outputs(output),
    };
  }
  return {
    result: JSON.stringify(build(input, output, otherOptions)),
    expect: JSON.stringify(expect),
  };
}

function outputs(
  outputOrOutputs: OutputOptions | OutputOptions[],
  withMin = false
) {
  return ([] as OutputOptions[]).concat(outputOrOutputs).map((output) => {
    output = { ...output };
    if (withMin && output.file) {
      output.file = output.file.replace(/.js$/, '.min.js');
    }
    output.sourcemap = !withMin;
    return output;
  });
}

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

function getPlugins(
  minify: boolean,
  resolveOnly: ReadonlyArray<string | RegExp>
) {
  const plugins = [
    json(),
    resolve({ extensions, resolveOnly }),
    commonjs(),
    babel({ extensions, include: ['src/**/*'], babelHelpers: 'bundled' }),
    filesize(),
  ];
  if (minify) {
    plugins.splice(4, 0, terser());
  }
  return plugins;
}
