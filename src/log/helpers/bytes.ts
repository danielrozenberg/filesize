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

const bytes = require('bytes');

/**
 * Format size into more human readable string.
 * @param size
 */
export function prettyBytes(size: number): string {
  return bytes(size, { unit: 'KB', fixedDecimals: true, unitSeparator: ' ' });
}

/**
 * Format delta into more human readable string.
 * @param current the current size of this file
 * @param comparison the previous size of this file (or matched file)
 */
export function prettyDelta(current: number, comparison: number | undefined): string {
  const delta = current - (comparison || 0);

  if (delta > 0) {
    return `+${bytes(delta)}`;
  }
  if (delta < 0) {
    return `-${bytes(delta)}`;
  }
  return '-';
}
