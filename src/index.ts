import { OutputOptions, ExternalOption, Plugin } from 'rollup';
import filesize from 'rollup-plugin-filesize';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import { defaults } from 'custom-defaults';

export type OtherOptions = {
  external?: ExternalOption;
  withMin?: boolean;
  resolveOnly?: ReadonlyArray<string | RegExp>;
};

export type BuildOptions = {
  input: string;
  external?: ExternalOption;
  plugins: Plugin[];
  output: OutputOptions[];
};

const defOtherOptions = {
  withMin: false,
  resolveOnly: [],
};

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export function build(
  input: string,
  output: OutputOptions | OutputOptions[],
  otherOptions?: { external?: ExternalOption; withMin: true }
): BuildOptions[];
export function build(
  input: string,
  output: OutputOptions | OutputOptions[],
  otherOptions?: { external?: ExternalOption; withMin?: boolean }
): BuildOptions;
export function build(
  input: string,
  outputOrOutputs: OutputOptions | OutputOptions[],
  otherOptions: OtherOptions = defOtherOptions
) {
  const { external, withMin, resolveOnly } = defaults(
    otherOptions,
    defOtherOptions
  );
  const config: BuildOptions = {
    input,
    external,
    plugins: [
      json(),
      resolve({ extensions, resolveOnly }),
      commonjs(),
      babel({ extensions, include: ['src/**/*'], babelHelpers: 'bundled' }),
    ],
    output: [],
  };

  const outputs = ([] as OutputOptions[]).concat(outputOrOutputs);
  const copy = outputs.map((item) => {
    return { ...item };
  });

  if (withMin) {
    copy.forEach((item: OutputOptions) => {
      if (item.file) item.file = item.file.replace(/.js$/, '.min.js');
      item.sourcemap = false;
    });
    config.plugins.push(terser());
    otherOptions = { ...otherOptions, withMin: false };
  } else {
    copy.forEach((item) => {
      item.sourcemap = true;
    });
  }
  config.plugins.push(filesize());
  config.output = copy;

  return withMin
    ? [build(input, outputOrOutputs, otherOptions), config]
    : config;
}
