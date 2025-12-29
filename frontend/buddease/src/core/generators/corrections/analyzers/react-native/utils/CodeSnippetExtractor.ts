// CodeSnippetExtractor.ts
export function extractCodeSnippet(content: string, pattern: RegExp, contextLines: number = 3): string {
  const lines = content.split('\n');
  let snippet = '';

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      const start = Math.max(0, i - contextLines);
      const end = Math.min(lines.length, i + contextLines + 1);
      snippet = lines.slice(start, end).join('\n');
      break;
    }
  }

  return snippet.substring(0, 500);
}

export function extractErrorContext(logContent: string, errorLine: string, contextLines: number = 2): string {
  const lines = logContent.split('\n');
  let context = '';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(errorLine)) {
      const start = Math.max(0, i - contextLines);
      const end = Math.min(lines.length, i + contextLines + 1);
      context = lines.slice(start, end).join('\n');
      break;
    }
  }

  return context.substring(0, 500);
}