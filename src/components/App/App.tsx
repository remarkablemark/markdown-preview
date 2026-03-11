import { useEffect, useRef, useState } from 'react';
import { useUrlPersistence } from 'src/hooks';
import type { LayoutMode } from 'src/types/markdown';

import { Editor } from '../Editor';
import { Layout } from '../Layout';
import { Preview } from '../Preview';

const MOBILE_BREAKPOINT = 768;

export function App() {
  const { markdown, setMarkdown } = useUrlPersistence();
  const [mode, setMode] = useState<LayoutMode>('split');
  const modeRef = useRef(mode);

  // Keep ref in sync with state
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      const currentMode = modeRef.current;

      // When resizing to mobile, hide preview and only show via toggle
      if (mobile && currentMode === 'split') {
        setMode('editor-only');
      }

      // When resizing back to desktop, restore split view
      if (!mobile && currentMode !== 'split') {
        setMode('split');
      }
    };

    // Initial check on mount
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleToggleView = () => {
    const newMode = mode === 'editor-only' ? 'preview-only' : 'editor-only';
    setMode(newMode);
  };

  return (
    <Layout mode={mode} onToggleView={handleToggleView}>
      <Editor value={markdown} onChange={setMarkdown} />
      <Preview markdown={markdown} />
    </Layout>
  );
}
