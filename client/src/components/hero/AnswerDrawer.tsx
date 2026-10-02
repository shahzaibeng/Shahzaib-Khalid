import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { FormEvent } from 'react';
import { FiArrowRight, FiArrowUpRight, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { Answer } from '../../lib/assistant';
import { ThinkingOrb } from './ThinkingOrb';
import { THINKING_STEPS } from '../../lib/chatbot/thinking';

export interface Exchange {
  id: number;
  question: string;
  /** Missing while the assistant is still thinking. */
  answer?: Answer;
  /** Index into THINKING_STEPS while thinking. */
  step: number;
}

interface AnswerDrawerProps {
  open: boolean;
  thread: Exchange[];
  onAsk: (question: string) => void;
  onClose: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

/** Slide-in panel that shows each question with its grounded answer. */
export function AnswerDrawer({ open, thread, onAsk, onClose }: AnswerDrawerProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Keep the newest answer in view and the follow-up field ready.
  useEffect(() => {
    if (!open) return;
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    input.current?.focus({ preventScroll: true });
  }, [open, thread.length]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = query.trim();
    if (!question) return;
    onAsk(question);
    setQuery('');
  }

  // Rendered at the document root so it sits above the fixed navbar and dock.
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="answer-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease }}
          >
            <header className="drawer-head">
              <div>
                <p id="answer-drawer-title" className="drawer-title">
                  Ask about Shahzaib
                </p>
                <p className="drawer-note">Answers come only from this portfolio.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={onClose}
                aria-label="Close answers"
                data-symbiote-target
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="drawer-body" aria-live="polite">
              {thread.map(({ id, question, answer, step }) => (
                <article key={id} className="exchange">
                  <p className="exchange-question">{question}</p>
                  {!answer ? (
                    <div className="thinking" role="status">
                      <ThinkingOrb />
                      <div>
                        <motion.p
                          key={step}
                          className="thinking-step"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {THINKING_STEPS[step]}
                        </motion.p>
                        <ol className="thinking-track" aria-hidden="true">
                          {THINKING_STEPS.map((label, index) => (
                            <li
                              key={label}
                              data-done={index < step || undefined}
                              data-active={index === step || undefined}
                            />
                          ))}
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="exchange-answer"
                      initial="hidden"
                      animate="shown"
                      variants={{ shown: { transition: { staggerChildren: 0.06 } } }}
                    >
                      <motion.p
                        className="exchange-summary"
                        variants={{ hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }}
                      >
                        {answer.summary}
                      </motion.p>
                      {answer.points.length > 0 && (
                        <ul className="exchange-points">
                          {answer.points.map((point) => (
                            <motion.li
                              key={point}
                              variants={{
                                hidden: { opacity: 0, y: 6 },
                                shown: { opacity: 1, y: 0 },
                              }}
                            >
                              {point}
                            </motion.li>
                          ))}
                        </ul>
                      )}
                      <motion.div
                        className="exchange-meta"
                        variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
                      >
                        {answer.sources.length > 0 && (
                          <span className="exchange-sources">
                            From: {answer.sources.join(' · ')}
                          </span>
                        )}
                        {answer.action && (
                          <button
                            type="button"
                            className="exchange-action"
                            data-symbiote-target
                            onClick={() => {
                              onClose();
                              navigate(`/#${answer.action!.overlay}`);
                            }}
                          >
                            {answer.action.label} <FiArrowUpRight aria-hidden="true" />
                          </button>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </article>
              ))}
              {thread.length > 0 && thread[thread.length - 1].answer && (
                <div className="exchange-followups" aria-label="Follow-up questions">
                  {thread[thread.length - 1].answer!.followUps.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="ask-chip"
                      data-symbiote-target
                      onClick={() => onAsk(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <div ref={end} />
            </div>

            <form className="drawer-ask" onSubmit={submit}>
              <label htmlFor="drawer-input" className="sr-only">
                Ask a follow-up question
              </label>
              <input
                ref={input}
                id="drawer-input"
                className="ask-input"
                type="text"
                autoComplete="off"
                maxLength={200}
                placeholder="Ask a follow-up…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="submit"
                className="ask-submit"
                aria-label="Ask"
                disabled={!query.trim()}
              >
                <FiArrowRight aria-hidden="true" size={16} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
