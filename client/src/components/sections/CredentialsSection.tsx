import type { IconType } from 'react-icons';
import { FiArrowUpRight, FiAward, FiCloud, FiCpu, FiDatabase } from 'react-icons/fi';
import { credentials } from '../../config/content';
import type { Credential, CredentialCategory } from '../../config/content';
import { isConfigured } from '../../lib/placeholder';
import { Section } from './Section';

const categoryIcon: Record<CredentialCategory, IconType> = {
  ai: FiCpu,
  cloud: FiCloud,
  data: FiDatabase,
  dev: FiAward,
};

// Layout previews for local development only. The DEV check lets the production build drop them.
const samples: Credential[] = !import.meta.env.DEV
  ? []
  : [
      {
        title: 'Generative AI Certificate',
        issuer: 'Issuing organisation',
        issued: 'Month Year',
        category: 'ai',
        verifyUrl: '',
      },
      {
        title: 'Cloud / DevOps Certificate',
        issuer: 'Issuing organisation',
        issued: 'Month Year',
        category: 'cloud',
        verifyUrl: '',
      },
      {
        title: 'Data Science Certificate',
        issuer: 'Issuing organisation',
        issued: 'Month Year',
        category: 'data',
        verifyUrl: '',
      },
    ];

function CredentialCard({ credential, sample }: { credential: Credential; sample: boolean }) {
  const Icon = categoryIcon[credential.category];
  const verifiable = !sample && isConfigured(credential.verifyUrl) && credential.verifyUrl !== '';
  return (
    <li className="credential-card" data-symbiote-target="card" data-sample={sample || undefined}>
      <div className="flex items-start justify-between gap-4">
        <span className="credential-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        {sample && <span className="credential-sample">Sample</span>}
      </div>
      <h3 className="mt-5 text-base font-semibold leading-snug text-ink">{credential.title}</h3>
      <p className="mt-1.5 text-sm text-muted">{credential.issuer}</p>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {credential.issued}
          {credential.credentialId && ` · ${credential.credentialId}`}
        </span>
        {verifiable && (
          <a
            href={credential.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="credential-verify"
            data-symbiote-target
            aria-label={`Verify ${credential.title} (opens in a new tab)`}
          >
            Verify <FiArrowUpRight aria-hidden="true" />
          </a>
        )}
      </div>
    </li>
  );
}

export function CredentialsSection() {
  const showSamples = credentials.length === 0 && import.meta.env.DEV;
  const list = showSamples ? samples : credentials;
  return (
    <Section id="credentials" index={4} label="Credentials" title="Verified, not just claimed.">
      {list.length > 0 ? (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((credential) => (
              <CredentialCard key={credential.title} credential={credential} sample={showSamples} />
            ))}
          </ul>
          {showSamples && (
            <p className="mt-5 font-mono text-xs text-muted">
              Dev preview: add real certifications to <code>credentials</code> in config/content.ts.
              Samples never appear in the production build.
            </p>
          )}
        </>
      ) : (
        <div className="credential-card">
          <p className="text-base leading-7 text-muted">
            Certifications are being added, each with a link to verify it with the issuer.
          </p>
        </div>
      )}
    </Section>
  );
}
