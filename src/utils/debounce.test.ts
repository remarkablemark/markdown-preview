import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('test');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledWith('test');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous calls when called multiple times', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('first');
    vi.advanceTimersByTime(200);

    debouncedFn('second');
    vi.advanceTimersByTime(200);

    debouncedFn('third');
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledWith('third');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should execute function with the latest arguments', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('arg1');
    debouncedFn('arg2');
    debouncedFn('arg3');

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('arg3');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('test');
    debouncedFn.cancel();

    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();
  });

  it('should handle cancel when no execution is pending', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    expect(() => {
      debouncedFn.cancel();
    }).not.toThrow();
  });

  it('should flush pending execution immediately', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('test');
    debouncedFn.flush();

    expect(fn).toHaveBeenCalledWith('test');
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle flush when no execution is pending', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    expect(() => {
      debouncedFn.flush();
    }).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
  });

  it('should allow multiple executions after delay', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('first');
    vi.advanceTimersByTime(300);

    debouncedFn('second');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });

  it('should handle rapid successive calls correctly', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    for (let i = 0; i < 10; i++) {
      debouncedFn(`call-${String(i)}`);
      vi.advanceTimersByTime(50);
    }

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('call-9');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset state after cancel', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('first');
    debouncedFn.cancel();

    debouncedFn('second');
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledWith('second');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset state after flush', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('first');
    debouncedFn.flush();

    debouncedFn('second');
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });
});
