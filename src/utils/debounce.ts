export function debounce(
  fn: (content: string) => void,
  delay: number,
): ((content: string) => void) & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: [string] | null = null;

  const debouncedFn = ((content: string) => {
    lastArgs = [content];

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      /* v8 ignore next -- @preserve */
      if (lastArgs) {
        fn(...lastArgs);
      }

      timeoutId = null;
      lastArgs = null;
    }, delay);
  }) as ((content: string) => void) & { cancel: () => void; flush: () => void };

  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debouncedFn.flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFn;
}
