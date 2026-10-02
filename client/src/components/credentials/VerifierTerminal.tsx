import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { credentials } from '../../config/content';
import type { Credential } from '../../config/content';
import { site } from '../../config/site';
import { GITHUB_USER, streaks } from '../../lib/github';
import type { GitHubActivity } from '../../lib/github';

type LineKind = 'in' | 'out' | 'ok' | 'warn' | 'dim' | 'hash';
interface Line {
  id: number;
  kind: LineKind;
  text: string;
}

export interface TerminalHandle {
  run: (command: string) => void;
}

const quick = ['verify cloudtek-fsai', 'verify cloudtek-pse', 'github', 'download --resume.pdf'];

/** The exact text that is hashed: every field of the record, in a fixed order. */
function canonical(credential: Credential) {
  return JSON.stringify({
    id: credential.id,
    title: credential.title,
    issuer: credential.issuer,
    issued: credential.issued,
    focus: credential.focus,
    holder: site.name,
  });
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** A small CLI for checking the credentials, GitHub activity, and fetching the resume. */
export const VerifierTerminal = forwardRef<TerminalHandle, { activity: GitHubActivity }>(
  function VerifierTerminal({ activity }, ref) {
    const nextId = useRef(0);
    const line = (kind: LineKind, text: string): Line => ({ id: nextId.current++, kind, text });
    const [lines, setLines] = useState<Line[]>(() => [
      line('dim', 'Proof of competency verifier v1.0 — type `help` for commands.'),
      line('dim', `Holder: ${site.name} · ${credentials.length} credentials on record.`),
    ]);
    const [input, setInput] = useState('');
    const body = useRef<HTMLDivElement>(null);
    const field = useRef<HTMLInputElement>(null);
    const activityRef = useRef(activity);
    useEffect(() => {
      activityRef.current = activity;
    }, [activity]);

    useEffect(() => {
      body.current?.scrollTo({ top: body.current.scrollHeight });
    }, [lines]);

    const print = (...next: Line[]) => setLines((current) => [...current, ...next]);

    async function execute(raw: string) {
      const command = raw.trim();
      if (!command) return;
      print(line('in', command));
      const [name, ...args] = command.toLowerCase().split(/\s+/);

      if (name === 'clear') {
        setLines([]);
        return;
      }
      if (name === 'help') {
        print(
          line('out', 'verify <id>            check a credential record and its fingerprint'),
          line('out', 'hash <id>              print the SHA-256 fingerprint of a record'),
          line('out', 'ls                     list credentials on record'),
          line('out', 'github                 contribution activity metrics'),
          line('out', 'download --resume.pdf  download the resume'),
          line('out', 'whoami · clear'),
        );
        return;
      }
      if (name === 'whoami') {
        print(line('out', `${site.name} — ${site.title}, ${site.location}`));
        return;
      }
      if (name === 'ls') {
        print(
          ...credentials.map((item) =>
            line('out', `${item.id.padEnd(15)} ${item.title} (${item.issuer}, ${item.issued})`),
          ),
        );
        return;
      }
      if (name === 'verify' || name === 'hash') {
        const credential = credentials.find((item) => item.id === args[0]);
        if (!credential) {
          print(line('warn', `No credential "${args[0] ?? ''}". Try \`ls\`.`));
          return;
        }
        const digest = await sha256(canonical(credential));
        if (name === 'hash') {
          print(line('hash', `sha256  ${digest}`));
          return;
        }
        print(
          line('out', `record     ${credential.title}`),
          line('out', `issuer     ${credential.issuer} · issued ${credential.issued}`),
          line('out', `focus      ${credential.focus.join(', ')}`),
          line('hash', `sha256     ${digest}`),
          line(
            'dim',
            'Fingerprint of the record shown on this page; it changes if any field is edited.',
          ),
          credential.verifyUrl
            ? line('ok', `issuer     ${credential.verifyUrl}`)
            : line(
                'warn',
                'issuer     public verification link not published yet — confirmation available on request',
              ),
        );
        if (credential.verifyUrl) window.open(credential.verifyUrl, '_blank', 'noopener');
        return;
      }
      if (name === 'github') {
        const current = activityRef.current;
        const { current: streak, longest } = streaks(current.days);
        print(
          line('out', `profile    github.com/${GITHUB_USER}  (${current.source} data)`),
          ...Object.entries(current.totals)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, total]) => line('out', `${year}       ${total} contributions`)),
          line('out', `streak     ${streak} days current · ${longest} days longest`),
          line('out', `repos      ${current.publicRepos} public`),
        );
        return;
      }
      if (name === 'download' && (args.includes('--resume.pdf') || args.includes('resume'))) {
        if (!site.resume.available) {
          print(line('warn', 'Resume not published yet.'));
          return;
        }
        const anchor = document.createElement('a');
        anchor.href = site.resume.href;
        anchor.download = `${site.name.replace(/\s+/g, '_')}_Resume.pdf`;
        anchor.click();
        print(line('ok', `Downloading ${anchor.download} …`));
        return;
      }
      print(line('warn', `command not found: ${name} — type \`help\``));
    }

    useImperativeHandle(ref, () => ({ run: (command) => void execute(command) }));

    function submit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      void execute(input);
      setInput('');
    }

    return (
      <section className="terminal" aria-labelledby="terminal-heading" data-symbiote-target="card">
        <header className="terminal-head">
          <span className="code-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <h3 id="terminal-heading" className="terminal-title">
            &gt;_ PROOF OF COMPETENCY VERIFIER v1.0
          </h3>
        </header>
        <div
          ref={body}
          className="terminal-body"
          role="log"
          aria-live="polite"
          onClick={() => field.current?.focus()}
        >
          {lines.map((item) => (
            <p key={item.id} className={`terminal-line terminal-${item.kind}`}>
              {item.kind === 'in' && <span className="terminal-prompt">visitor@sk ~ % </span>}
              {item.text}
            </p>
          ))}
          <form className="terminal-input" onSubmit={submit}>
            <label htmlFor="terminal-input" className="terminal-prompt">
              visitor@sk ~ %
            </label>
            <input
              ref={field}
              id="terminal-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              maxLength={80}
              aria-label="Terminal command"
            />
          </form>
        </div>
        <div className="terminal-quick" aria-label="Quick commands">
          {quick.map((command) => (
            <button
              key={command}
              type="button"
              className="terminal-chip"
              data-symbiote-target
              onClick={() => void execute(command)}
            >
              &gt; {command}
            </button>
          ))}
        </div>
      </section>
    );
  },
);
