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

import { ConditionFunction, Context } from './Condition';
import { isDirectory, isFile } from '../helpers/fs';
import { resolve } from 'path';
import { MakeError } from '../log/helpers/error';

/**
 * Ensure context contains a valid project directory and `package.json` inside.
 * @param context
 */
const Project: ConditionFunction = (context: Context) => {
  return async function() {
    const projectPath: string = resolve(context.projectPath);
    if (!(await isDirectory(projectPath))) {
      return MakeError(`project specified '${context.projectPath}' doesn't exist, is this a valid project?`);
    }

    const packagePath: string = resolve(context.projectPath, 'package.json');
    if (!(await isFile(packagePath))) {
      return MakeError(`Missing '${packagePath}', is this a valid project?`);
    }

    context.projectPath = projectPath;
    context.packagePath = packagePath;
    return null;
  };
};

export default Project;
