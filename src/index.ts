import { OutputOptions, ExternalOption, Plugin } from 'rollup';
import filesize from 'rollup-plugin-filesize';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

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

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export function build(
  input: string,
  output: OutputOptions | OutputOptions[],
  otherOptions?: OtherOptions & { withMin: true }
): BuildOptions[];
export function build(
  input: string,
  output: OutputOptions | OutputOptions[],
  otherOptions?: OtherOptions
): BuildOptions;
export function build(
  input: string,
  outputOrOutputs: OutputOptions | OutputOptions[],
  otherOptions?: OtherOptions
) {
  let external: ExternalOption | undefined = undefined;
  let withMin = false;
  let resolveOnly: readonly (string | RegExp)[] = [];
  if (otherOptions) {
    if (otherOptions.external !== undefined) external = otherOptions.external;
    if (otherOptions.withMin !== undefined) withMin = otherOptions.withMin;
    if (otherOptions.resolveOnly !== undefined)
      resolveOnly = otherOptions.resolveOnly;
  }

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
