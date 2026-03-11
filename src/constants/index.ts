export const DEFAULT_MARKDOWN = `# Heading

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

export const URL_PARAM_KEY = 'md' as const;
export const MAX_URL_LENGTH = 2048;
export const URL_UPDATE_DEBOUNCE_MS = 500;
