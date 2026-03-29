import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_MARKDOWN,
  URL_PARAM_KEY,
  URL_UPDATE_DEBOUNCE_MS,
} from 'src/constants';
import type { UseUrlPersistenceReturn } from 'src/types/urlPersistence.types';
import {
  checkUrlLength,
  debounce,
  decodeMarkdown,
  encodeMarkdown,
} from 'src/utils';

export function useUrlPersistence(
  initialMarkdown?: string,
): UseUrlPersistenceReturn {
  const [markdown, setMarkdownState] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(URL_PARAM_KEY);

    let initialContent = initialMarkdown ?? DEFAULT_MARKDOWN;

    if (encoded) {
      const result = decodeMarkdown(encoded);
      if (result.success) {
        initialContent = result.decoded;
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMarkdownState(initialContent);
  }, [initialMarkdown]);

  const debouncedSync = useMemo(
    () =>
      debounce((content: string) => {
        const result = encodeMarkdown(content);
        const check = checkUrlLength(result.encoded);

        if (check.exceedsLimit) {
          // eslint-disable-next-line no-console
          console.warn(
            `Encoded markdown exceeds URL length limit ` +
              `(${String(check.actualLength)} > ${String(check.maxLength)})`,
          );
        }

        const url = new URL(window.location.href);
        url.searchParams.set(URL_PARAM_KEY, result.encoded);
        window.history.replaceState(null, '', url.toString());
      }, URL_UPDATE_DEBOUNCE_MS),
    [],
  );

  const setMarkdown = useCallback(
    (value: string) => {
      setMarkdownState(value);
      debouncedSync(value);
    },
    [debouncedSync],
  );

  return {
    markdown,
    setMarkdown,
  };
}
