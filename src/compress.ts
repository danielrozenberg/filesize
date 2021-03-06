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

import { Context, Compression, OrderedCompressionValues, maxSize } from './validation/Condition';
import { cpus } from 'os';
import { constants as brotliConstants, brotliCompress, gzip, ZlibOptions } from 'zlib';
import { readFile } from './helpers/fs';
import { LogError } from './log/helpers/error';
import { Report } from './log/report';
import { TTYReport } from './log/tty-report';
import { stdout } from 'process';

const COMPRESSION_CONCURRENCY = cpus().length;
const BROTLI_OPTIONS = {
  params: {
    [brotliConstants.BROTLI_PARAM_MODE]: brotliConstants.BROTLI_DEFAULT_MODE,
    [brotliConstants.BROTLI_PARAM_QUALITY]: brotliConstants.BROTLI_MAX_QUALITY,
    [brotliConstants.BROTLI_PARAM_SIZE_HINT]: 0,
  },
};
const GZIP_OPTIONS: ZlibOptions = {
  level: 9,
};

interface CompressionItem {
  path: string;
  compression: Compression;
  maxSize: maxSize;
}

/**
 * Use the given configuration and actual size to report item filesize.
 * @param report Optional reporter to update with this value
 * @param item Configuration for an Item
 * @param error Error from compressing an Item
 * @param size actual size for this comparison
 */
function store(
  report: Report | null,
  context: Context,
  item: CompressionItem,
  error: Error | null,
  size: number,
): boolean {
  if (error !== null) {
    LogError(`Could not compress '${item.path}' with '${item.compression}'.`);
    return false;
  }

  // Store the size of the item in the compression map.
  const sizeMap = context.compressed.get(item.path);
  if (sizeMap === undefined) {
    LogError(`Could not find item '${item.path}' with '${item.compression}' in compression map.`);
    return false;
  }
  sizeMap[OrderedCompressionValues.indexOf(item.compression)][0] = size;

  report?.update(context);
  if (item.maxSize === undefined) {
    return true;
  }
  return size < item.maxSize;
}

/**
 * Compress an Item and report status to the console.
 * @param item Configuration for an Item.
 */
async function compressor(report: Report | null, context: Context, item: CompressionItem): Promise<boolean> {
  const contents = context.fileContents.get(item.path);
  if (contents) {
    const buffer = Buffer.from(contents, 'utf8');

    switch (item.compression) {
      case 'brotli':
        return new Promise(resolve =>
          brotliCompress(buffer, BROTLI_OPTIONS, (error: Error | null, result: Buffer) =>
            resolve(store(report, context, item, error, result.byteLength)),
          ),
        );
      case 'gzip':
        return new Promise(resolve =>
          gzip(buffer, GZIP_OPTIONS, (error: Error | null, result: Buffer) =>
            resolve(store(report, context, item, error, result.byteLength)),
          ),
        );
      default:
        return store(report, context, item, null, buffer.byteLength);
    }
  }

  return false;
}

/**
 * Store the original content so it isn't retrieved from FileSystem for each compression.
 * @param context
 * @param path
 */
async function storeOriginalFileContents(context: Context, path: string): Promise<void> {
  if (!context.fileContents.has(path)) {
    let content = await readFile(path);
    if (context.fileModifier !== null && content !== null) {
      content = context.fileModifier(content);
    }
    context.fileContents.set(path, content || '');
  }
}

/**
 * Find all items to compress, and store them for future compression.
 * @param context
 * @param findDefaultSize
 */
async function findItemsToCompress(context: Context, findDefaultSize: boolean): Promise<Array<CompressionItem>> {
  const toCompress: Array<CompressionItem> = [];
  for (const [path, sizeMapValue] of context.compressed) {
    for (let iterator: number = 0; iterator < OrderedCompressionValues.length; iterator++) {
      const compression: Compression = OrderedCompressionValues[iterator] as Compression;
      const [size, maxSize] = sizeMapValue[iterator];
      await storeOriginalFileContents(context, path);
      if (findDefaultSize && compression === 'none') {
        await compressor(null, context, { path, compression, maxSize });
      }
      if (size !== undefined) {
        toCompress.push({
          path,
          compression,
          maxSize,
        });
      }
    }
  }

  return toCompress;
}

/**
 * Given a context, compress all Items within splitting work eagly per cpu core to achieve some concurrency.
 * @param context Finalized Valid Context from Configuration
 */
export default async function* compress(context: Context, outputReport: boolean): AsyncGenerator<boolean, boolean> {
  const toCompress: Array<CompressionItem> = await findItemsToCompress(context, true);
  const report: Report | null = outputReport
    ? null
    : stdout.isTTY && toCompress.length < 30
    ? new TTYReport(context)
    : new Report(context);
  let success: boolean = true;

  for (let iterator: number = 0; iterator < toCompress.length; iterator += COMPRESSION_CONCURRENCY) {
    if (iterator === 0) {
      report?.update(context);
    }
    let itemsSuccessful = await Promise.all(
      toCompress.slice(iterator, iterator + COMPRESSION_CONCURRENCY).map(item => compressor(report, context, item)),
    );
    if (itemsSuccessful.includes(false)) {
      success = false;
    }
    yield success;
  }

  report?.end();
  return success;
}
