export interface UseUrlPersistenceReturn {
  markdown: string;
  setMarkdown: (value: string) => void;
}

export interface EncodeResult {
  success: true;
  encoded: string;
  compressedLength: number;
}

export type DecodeResult =
  | { success: true; decoded: string }
  | { success: false; error: Error };

export interface UrlLengthCheck {
  exceedsLimit: boolean;
  actualLength: number;
  maxLength: number;
  percentUsed: number;
}
