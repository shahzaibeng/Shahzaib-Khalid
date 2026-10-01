import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import { site } from '../../config/site';
import { isConfigured } from '../../lib/placeholder';
import { SocialLinks } from '../SocialLinks';
import { Section } from './Section';

export function ContactSection() {
  const emailReady = isConfigured(site.email);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  // Until the contact API exists, the form hands the message to the visitor's email app.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry from ${name.trim()}`);
    const body = encodeURIComponent(message.trim());
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  }

  return (
    <Section id="contact" label="Contact" title="A place to start a conversation.">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <p className="text-base leading-8 text-muted sm:text-lg">
            Have a project, a role, or an idea worth exploring together? Send a note and I’ll get
            back to you.
          </p>
          {emailReady && (
            <a href={`mailto:${site.email}`} className="text-link mt-6 text-base">
              <FiMail aria-hidden="true" /> {site.email}
            </a>
          )}
          <div className="mt-8">
            <p className="eyebrow mb-3">Or find me on</p>
            <SocialLinks />
          </div>
        </div>
        <form className="card space-y-5" onSubmit={handleSubmit} aria-describedby="contact-note">
          <fieldset disabled={!emailReady} className="space-y-5 disabled:opacity-60">
            <div>
              <label htmlFor="contact-name" className="field-label">
                Your name
              </label>
              <input
                id="contact-name"
                className="field"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="field-label">
                Message
              </label>
              <textarea
                id="contact-message"
                className="field min-h-36 resize-y"
                required
                maxLength={2000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <button type="submit" className="button-primary" data-symbiote-target>
              Open in email app <FiSend aria-hidden="true" />
            </button>
          </fieldset>
          <p id="contact-note" className="text-xs leading-5 text-muted">
            {emailReady
              ? 'Your message opens in your own email app; nothing is stored on this site.'
              : 'The contact form opens soon. Until then, please use the links alongside.'}
          </p>
        </form>
      </div>
    </Section>
  );
}
