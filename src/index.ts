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

import mri from 'mri';
import Project from './validation/Project';
import Config from './validation/Config';
import Comparison from './validation/Comparison';
import { Context } from './validation/Condition';
import compress from './compress';
import { LogError } from './log/helpers/error';
import { shutdown } from './helpers/process';
import { persist } from './helpers/persist';

const args = mri(process.argv.slice(2), {
  alias: { p: 'project', c: 'comparison' },
  default: { project: process.cwd(), silent: false, comparison: null },
});

/**
 * Perform a few steps:
 * 1. Read the configuration from the specified project
 * 2. Validate it
 * 3. Perform requested compression
 * 4. Report the results.
 */
(async function() {
  const { project: projectPath, silent, comparison } = args;
  const conditions = [Project, Config, Comparison];
  const context: Context = {
    projectPath,
    packagePath: '',
    packageContent: '',
    silent,
    track: false,
    originalPaths: new Map(),
    // Stores the result of compression <path, [...results]>
    compressed: new Map(),
    pattern: null,
    comparisonPath: comparison,
    // Stores the basis of comparison.
    comparison: new Map(),
  };

  let errorOccured: boolean = false;
  for (const condition of conditions) {
    const message = await condition(context)();
    if (message !== null) {
      LogError(message);
      shutdown(5);
      errorOccured = true;
    }
  }

  if (!errorOccured) {
    const compressionSuccess = await compress(context);
    await persist(context);
    if (!compressionSuccess) {
      shutdown(6);
    }
  }
})();
