import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { heroHud } from '../../config/content';

/** The hero search field and quick-prompt chips. */
export function AskBar({ onAsk }: { onAsk: (question: string) => void }) {
  const [query, setQuery] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = query.trim();
    if (!question) return;
    onAsk(question);
    setQuery('');
  }

  return (
    <div className="ask">
      <form className="ask-bar" role="search" onSubmit={submit} data-symbiote-target="card">
        <FiSearch className="ask-icon" aria-hidden="true" size={17} />
        <label htmlFor="ask-input" className="sr-only">
          Ask about {`Shahzaib's`} work
        </label>
        <input
          id="ask-input"
          className="ask-input"
          type="text"
          autoComplete="off"
          maxLength={200}
          placeholder={heroHud.askPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" className="ask-submit" aria-label="Ask" disabled={!query.trim()}>
          <FiArrowRight aria-hidden="true" size={16} />
        </button>
      </form>
      <ul className="ask-prompts" aria-label="Suggested questions">
        {heroHud.prompts.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              className="ask-chip"
              data-symbiote-target
              onClick={() => onAsk(prompt)}
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
