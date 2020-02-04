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

import test from 'ava';
import Config from '../../src/validation/Config';
import { Context } from '../../src/validation/Condition';

test('missing package.json should fail', async t => {
  const context: Context = {
    packagePath: 'test/config-validation/fixtures/missing-package-json/package.json',
    projectPath: 'test/config-validation/fixtures/missing-package-json',
    packageContent: '',
    compressed: new Map(),
    comparison: new Map(),
    silent: false,
  };
  const message = await Config(context)();

  t.is(message, `error Could not read the configuration in '${context.packagePath}'`);
});

test('unparseable package.json should fail', async t => {
  const context: Context = {
    packagePath: 'test/config-validation/fixtures/unparseable-package-json/package.json',
    projectPath: 'test/config-validation/fixtures/unparseable-package-json',
    packageContent: '',
    compressed: new Map(),
    comparison: new Map(),
    silent: false,
  };
  const message = await Config(context)();

  t.is(message, `error Could not parse '${context.packagePath}'`);
});

test("missing 'filesize' key from package.json should fail", async t => {
  const context: Context = {
    packagePath: 'test/config-validation/fixtures/missing-configuration/package.json',
    projectPath: 'test/config-validation/fixtures/missing-configuration',
    packageContent: '',
    compressed: new Map(),
    comparison: new Map(),
    silent: false,
  };
  const message = await Config(context)();

  t.is(message, `error There is no 'filesize' configuration in '${context.packagePath}'`);
});

test("missing path from item in 'filesize' should fail", async t => {
  const context: Context = {
    packagePath: 'test/config-validation/fixtures/item-path-missing/package.json',
    projectPath: 'test/config-validation/fixtures/item-path-missing',
    packageContent: '',
    compressed: new Map(),
    comparison: new Map(),
    silent: false,
  };
  const message = await Config(context)();

  t.is(message, `error There is no data inside the 'filesize' configuration in '${context.packagePath}'`);
});

test("missing maxSize from item in 'filesize' should fail", async t => {
  const context: Context = {
    packagePath: 'test/config-validation/fixtures/max-size-missing/package.json',
    projectPath: 'test/config-validation/fixtures/max-size-missing',
    packageContent: '',
    compressed: new Map(),
    comparison: new Map(),
    silent: false,
  };
  const message = await Config(context)();

  t.is(message, `error Configuration for '${context.projectPath}/index.js' is invalid. (size unspecified)`);
});

test("missing compression from item in 'filesize' should fail", async t => {
  const context: Context = {
    packagePath: 'test/config-validation/fixtures/compression-missing/package.json',
    projectPath: 'test/config-validation/fixtures/compression-missing',
    packageContent: '',
    compressed: new Map(),
    comparison: new Map(),
    silent: false,
  };
  const message = await Config(context)();

  t.is(message, `error Configuration for '${context.projectPath}/index.js' is invalid. (compression values unspecified)`);
});
