import { checkUrlLength, decodeMarkdown, encodeMarkdown } from './urlEncoder';

describe('urlEncoder', () => {
  describe('encodeMarkdown', () => {
    it('should encode markdown to URL-safe string', () => {
      const markdown = '# Hello World';
      const result = encodeMarkdown(markdown);

      expect(result.success).toBe(true);
      expect(result.encoded).toBeTruthy();
      expect(result.compressedLength).toBeGreaterThan(0);
    });

    it('should handle empty string', () => {
      const result = encodeMarkdown('');
      expect(result.success).toBe(true);
    });

    it('should handle Unicode characters', () => {
      const markdown = '你好 🎉 Hello';
      const result = encodeMarkdown(markdown);
      expect(result.success).toBe(true);
    });

    it('should handle special characters', () => {
      const markdown = '<>&"\'`\n\t';
      const result = encodeMarkdown(markdown);
      expect(result.success).toBe(true);
    });

    it('should complete in under 100ms', () => {
      const markdown = 'x'.repeat(5000);
      const start = performance.now();
      encodeMarkdown(markdown);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('decodeMarkdown', () => {
    it('should decode encoded markdown', () => {
      const original = '# Test\n\nContent';
      const encoded = encodeMarkdown(original);

      const result = decodeMarkdown(encoded.encoded);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.decoded).toBe(original);
      }
    });

    it('should return error for invalid input', () => {
      const result = decodeMarkdown('invalid!!!data');
      expect(result.success).toBe(false);
    });

    it('should complete in under 100ms', () => {
      const markdown = 'x'.repeat(5000);
      const encoded = encodeMarkdown(markdown);

      const start = performance.now();
      decodeMarkdown(encoded.encoded);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('round-trip fidelity', () => {
    const testCases = [
      '# Simple',
      'Unicode: 你好 🎉',
      'Special: <>&"\'',
      'Whitespace:\n\n\t  ',
      '',
      'x'.repeat(1000),
    ];

    testCases.forEach((testCase) => {
      it(`should preserve: ${testCase.substring(0, 20)}...`, () => {
        const encoded = encodeMarkdown(testCase);
        expect(encoded.success).toBe(true);

        const decoded = decodeMarkdown(encoded.encoded);
        expect(decoded.success).toBe(true);

        if (decoded.success) {
          expect(decoded.decoded).toBe(testCase);
        }
      });
    });
  });

  describe('checkUrlLength', () => {
    it('should detect when length exceeds limit', () => {
      const longString = 'x'.repeat(3000);
      const check = checkUrlLength(longString);

      expect(check.exceedsLimit).toBe(true);
      expect(check.actualLength).toBe(3000);
      expect(check.maxLength).toBe(2048);
      expect(check.percentUsed).toBeGreaterThan(100);
    });

    it('should calculate percentage correctly', () => {
      const shortString = 'x'.repeat(1024);
      const check = checkUrlLength(shortString);

      expect(check.exceedsLimit).toBe(false);
      expect(check.percentUsed).toBe(50);
    });
  });
});
