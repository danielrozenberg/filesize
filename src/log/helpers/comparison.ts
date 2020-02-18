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

// Please note: This is an implementation of the pattern in `travis-size-report`.
// It (https://github.com/GoogleChromeLabs/travis-size-report) may be a better
// fit for your workflow than this plugin, you should check it out!

import escapeRE from 'escape-string-regexp';
import { Context } from '../../validation/Condition';

function findComparisonPath(context: Context, current: string): string {
  if (context.comparison.has(current)) {
    return current;
  }

  if (context.pattern) {
  }

  const comparedSize = context.comparison.get(path)?.[OrderedCompressionValues.indexOf('none')]?.[0];
}

function createPattern(pattern: string | null): RegExp {}
