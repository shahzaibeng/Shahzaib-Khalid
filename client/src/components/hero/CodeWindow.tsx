import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '../../hooks/useMotionPreference';
import { codeSamples } from './codeSamples';
import type { Language } from './codeSamples';

const commentMarker: Record<Language, string> = { ts: '//', py: '#', sql: '--', docker: '#' };

const keywords: Record<Language, RegExp> = {
  ts: /^(import|from|export|async|function|const|await|return|new|type|interface)$/,
  py: /^(from|import|class|async|def|await|return|for|in|or|None|True|False)$/,
  sql: /^(CREATE|EXTENSION|IF|NOT|EXISTS|TABLE|PRIMARY|KEY|NULL|DEFAULT|INDEX|ON|USING|SELECT|FROM|ORDER|BY|LIMIT)$/,
  docker: /^(FROM|AS|WORKDIR|COPY|RUN|USER|EXPOSE|CMD|ENV)$/,
};

type Token = { text: string; kind: string };

// A small highlighter: comments, strings, keywords, calls, types, and numbers.
function tokenize(line: string, language: Language): Token[] {
  const commentAt = line.indexOf(commentMarker[language]);
  const code = commentAt >= 0 ? line.slice(0, commentAt) : line;
  const tokens: Token[] = [];
  const pattern = /("[^"]*"?|'[^']*'?|`[^`]*`?|@\w+|\b\d+\b|\w+|\s+|.)/g;
  for (const [text] of code.matchAll(pattern)) {
    let kind = 'plain';
    if (/^["'`]/.test(text)) kind = 'string';
    else if (text.startsWith('@')) kind = 'decorator';
    else if (keywords[language].test(text)) kind = 'keyword';
    else if (/^\d/.test(text)) kind = 'number';
    else if (/^[A-Z][a-z]\w*$/.test(text)) kind = 'type';
    tokens.push({ text, kind });
  }
  // A word followed by "(" is a call.
  tokens.forEach((token, i) => {
    if (token.kind === 'plain' && /^\w+$/.test(token.text) && tokens[i + 1]?.text === '(') {
      token.kind = 'call';
    }
  });
  if (commentAt >= 0) tokens.push({ text: line.slice(commentAt), kind: 'comment' });
  return tokens;
}

interface CodeWindowProps {
  active: number;
  onSelect: (index: number) => void;
  /** While true (the visitor is inspecting a file), the window stays on it. */
  held: boolean;
}

/** A glass editor window that types out the active file, then moves to the next one. */
export function CodeWindow({ active, onSelect, held }: CodeWindowProps) {
  const { reducedMotion, visible } = useMotionPreference();
  // Progress belongs to one file, so switching files starts from zero without an effect.
  const [progress, setProgress] = useState({ file: active, typed: 0 });
  const typed = progress.file === active ? progress.typed : 0;
  const [inView, setInView] = useState(true);
  const container = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const sample = codeSamples[active];
  const animate = !reducedMotion && visible && inView;
  const shown = reducedMotion ? sample.code.length : typed;

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Keep the active tab in view.
  useEffect(() => {
    const strip = tabs.current;
    const tab = strip?.children[active] as HTMLElement | undefined;
    if (strip && tab) {
      strip.scrollTo({ left: tab.offsetLeft - strip.clientWidth / 2 + tab.offsetWidth / 2 });
    }
  }, [active]);

  useEffect(() => {
    if (!animate) return;
    if (typed < sample.code.length) {
      // Whitespace runs are typed at once so indentation doesn't feel sluggish.
      const next = sample.code.slice(typed).match(/^\s+/)?.[0].length ?? 3;
      const timer = setTimeout(
        () => setProgress({ file: active, typed: typed + next }),
        18 + Math.random() * 24,
      );
      return () => clearTimeout(timer);
    }
    if (held) return;
    const timer = setTimeout(() => onSelect((active + 1) % codeSamples.length), 4200);
    return () => clearTimeout(timer);
  }, [animate, typed, sample.code, held, active, onSelect]);

  const lines = sample.code.slice(0, shown).split('\n');
  const done = shown >= sample.code.length;

  return (
    <div ref={container} className="code-window" data-symbiote-target="card">
      <div className="code-titlebar">
        <span className="code-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div ref={tabs} className="code-tabs" role="tablist" aria-label="Code samples">
          {codeSamples.map((item, index) => (
            <button
              key={item.file}
              type="button"
              role="tab"
              aria-selected={index === active}
              className="code-tab"
              onClick={() => onSelect(index)}
            >
              {item.file.split('/').pop()}
            </button>
          ))}
        </div>
      </div>
      <pre className="code-body" aria-label={`${sample.file} source`} data-file={sample.file}>
        <code>
          {lines.map((line, index) => (
            <span key={`${active}-${index}`} className="code-line">
              <span className="code-gutter" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                {tokenize(line, sample.language).map((token, i) => (
                  <span key={i} className={`tok-${token.kind}`}>
                    {token.text}
                  </span>
                ))}
                {index === lines.length - 1 && <span className="code-caret" aria-hidden="true" />}
              </span>
            </span>
          ))}
        </code>
      </pre>
      <div className="code-status">
        <span>
          {sample.file} · {sample.status}
        </span>
        <span className={done ? 'code-status-ok' : undefined}>{done ? '✓ Ready' : 'Typing…'}</span>
      </div>
    </div>
  );
}
