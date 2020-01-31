/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import Project from './validation/Project';
import Config from './validation/Config';
import { Context, ItemConfig, CompressionMap } from './validation/Condition';
import compress from './compress';

export async function report(project: string): Promise<Map<ItemConfig['path'], CompressionMap>> {
  const conditions = [Project, Config];
  let context: Context = {
    project,
    package: '',
    config: [],
    track: [],
    silent: true,
  };

  for (const condition of conditions) {
    const message = await condition(context)();
    if (message !== null) {
      throw message;
    }
  }

  const { 1: report } = await compress(context);
  return report;
}