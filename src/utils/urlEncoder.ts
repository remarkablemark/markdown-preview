import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import { MAX_URL_LENGTH } from 'src/constants';
import type {
  DecodeResult,
  EncodeResult,
  UrlLengthCheck,
} from 'src/types/urlPersistence.types';

export function encodeMarkdown(markdown: string): EncodeResult {
  const encoded = compressToEncodedURIComponent(markdown);
  return {
    success: true,
    encoded,
    compressedLength: encoded.length,
  };
}

export function decodeMarkdown(encoded: string): DecodeResult {
  try {
    const decoded = decompressFromEncodedURIComponent(encoded);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (decoded === null) {
      return {
        success: false,
        error: new Error('Invalid encoded data'),
      };
    }

    return {
      success: true,
      decoded,
    };
  } catch (error) {
    /* v8 ignore start */
    return {
      success: false,
      error: error as Error,
    };
    /* v8 ignore end */
  }
}

export function checkUrlLength(encoded: string): UrlLengthCheck {
  const actualLength = encoded.length;
  const percentUsed = (actualLength / MAX_URL_LENGTH) * 100;

  return {
    exceedsLimit: actualLength > MAX_URL_LENGTH,
    actualLength,
    maxLength: MAX_URL_LENGTH,
    percentUsed,
  };
}
