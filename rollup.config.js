/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import MagicString from 'magic-string';

function makeExecutable() {
  return {
    name: 'make-executable',
    renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName === 'filesize') {
        const magicString = new MagicString(code);
        magicString.prepend('#!/usr/bin/env node\n\n');
        return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
      }
    },
  };
}

const external = ['os', 'zlib', 'path', 'fs', 'stream', 'util', 'events', 'fast-glob', 'process', 'prettier', 'child_process'];
const plugins = executable => [
  resolve({ preferBuiltins: true }),
  commonjs({ include: 'node_modules/**' }),
  typescript({ tsconfig: 'src/tsconfig.json', include: '**/*.ts', exclude: 'dist/**/*.ts' }),
  executable ? compiler() : null,
  executable ? makeExecutable() : null,
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/filesize',
      format: 'cjs',
      sourcemap: false,
    },
    external,
    plugins: plugins(true),
  },
  {
    input: 'src/api.ts',
    output: {
      file: 'dist/api.mjs',
      format: 'esm',
      sourcemap: false,
    },
    external,
    plugins: plugins(false),
  },
];
