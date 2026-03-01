import { useEffect, useRef, useState } from 'react';

import type { LayoutMode } from '../../types/markdown';
import { Editor } from '../Editor';
import { Layout } from '../Layout';
import { Preview } from '../Preview';

const MOBILE_BREAKPOINT = 768;

const DEFAULT_MARKDOWN = `# Heading

**bold** *italic* \`inline code\`

- Unordered list
- Another item

1. Ordered list
2. Second item

[link](https://example.com)

![image](https://picsum.photos/100)

> Blockquote

\`\`\`js
const greeting = "Hello";
console.log(greeting);
\`\`\`

| Table | Header |
|-------|--------|
| Cell  | Data   |

---

- [ ] Task
- [x] Done
`;

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
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
