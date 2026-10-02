import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { FiCheckCircle, FiLoader, FiMail, FiSend } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { site } from '../../config/site';
import { SocialLinks } from '../SocialLinks';
import { Section } from './Section';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const API = `${import.meta.env.VITE_API_URL ?? '/api'}/contact`;

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string; offerEmailApp: boolean };

type Field = 'name' | 'email' | 'message';

function validate(values: Record<Field, string>) {
  const errors: Partial<Record<Field, string>> = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.message.trim().length < 10) errors.message = 'Please write at least 10 characters.';
  return errors;
}

export function ContactSection() {
  const location = useLocation();
  // The Verify Credential buttons arrive here with a drafted message.
  const draft = (location.state as { contactDraft?: string } | null)?.contactDraft ?? '';
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    email: '',
    message: draft,
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const honeypot = useRef<HTMLInputElement>(null);
  const nameField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!draft) return;
    const field = nameField.current;
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field?.focus({ preventScroll: true });
  }, [draft]);

  const update = (field: Field) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const emailAppLink = () =>
    `mailto:${site.email}?subject=${encodeURIComponent(`Portfolio message from ${values.name.trim()}`)}&body=${encodeURIComponent(values.message.trim())}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus({ kind: 'sending' });
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, company: honeypot.current?.value ?? '' }),
      });
      if (response.ok) {
        setStatus({ kind: 'sent' });
        setValues({ name: '', email: '', message: '' });
        return;
      }
      const body = await response.json().catch(() => null);
      const code: string | undefined = body?.error?.code;
      setStatus({
        kind: 'error',
        message:
          code === 'NOT_CONFIGURED' || response.status >= 500 || !body
            ? 'The message could not be sent from here right now.'
            : (body?.error?.message ?? 'Something went wrong.'),
        offerEmailApp: code !== 'RATE_LIMITED' && response.status !== 422,
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Network error — the message was not sent.',
        offerEmailApp: true,
      });
    }
  }

  const sending = status.kind === 'sending';

  return (
    <Section id="contact" label="Contact" title="A place to start a conversation.">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <p className="text-base leading-8 text-muted sm:text-lg">
            Have a project, a role, or an idea worth exploring together? Send a note and I’ll get
            back to you.
          </p>
          <a href={`mailto:${site.email}`} className="text-link mt-6 text-base">
            <FiMail aria-hidden="true" /> {site.email}
          </a>
          <div className="mt-8">
            <p className="eyebrow mb-3">Or find me on</p>
            <SocialLinks />
          </div>
        </div>

        {status.kind === 'sent' ? (
          <div className="card contact-sent" role="status">
            <FiCheckCircle aria-hidden="true" className="contact-sent-icon" />
            <p className="contact-sent-title">
              Message transmitted successfully. Shahzaib will get back to you shortly.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => setStatus({ kind: 'idle' })}
              data-symbiote-target
            >
              Send another message
            </button>
          </div>
        ) : (
          <form className="card space-y-5" onSubmit={handleSubmit} noValidate aria-busy={sending}>
            <fieldset disabled={sending} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="field-label">
                    Your name
                  </label>
                  <input
                    ref={nameField}
                    id="contact-name"
                    className="field"
                    autoComplete="name"
                    maxLength={100}
                    value={values.name}
                    onChange={update('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="field-error">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-email" className="field-label">
                    Your email
                  </label>
                  <input
                    id="contact-email"
                    className="field"
                    type="email"
                    autoComplete="email"
                    maxLength={200}
                    value={values.email}
                    onChange={update('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="field-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="field-label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  className="field min-h-36 resize-y"
                  maxLength={2000}
                  value={values.message}
                  onChange={update('message')}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                />
                {errors.message && (
                  <p id="contact-message-error" className="field-error">
                    {errors.message}
                  </p>
                )}
              </div>
              {/* Hidden from people; bots that fill it are ignored. */}
              <input
                ref={honeypot}
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="contact-honeypot"
                aria-hidden="true"
              />
              <button type="submit" className="button-primary" data-symbiote-target>
                {sending ? (
                  <>
                    Sending <FiLoader aria-hidden="true" className="animate-spin" />
                  </>
                ) : (
                  <>
                    Send message <FiSend aria-hidden="true" />
                  </>
                )}
              </button>
            </fieldset>
            <div aria-live="polite">
              {status.kind === 'error' && (
                <p className="contact-error">
                  {status.message}{' '}
                  {status.offerEmailApp && (
                    <a href={emailAppLink()} className="text-link">
                      Send it from your email app instead
                    </a>
                  )}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </Section>
  );
}
