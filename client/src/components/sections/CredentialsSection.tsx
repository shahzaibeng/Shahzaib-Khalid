import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IconType } from 'react-icons';
import { FiArrowUpRight, FiAward, FiCloud, FiCpu, FiDatabase } from 'react-icons/fi';
import { credentials, milestones, verifyRequestMessage } from '../../config/content';
import type { CredentialCategory } from '../../config/content';
import { useGitHubActivity, YEARS } from '../../lib/github';
import { ContributionGraph } from '../credentials/ContributionGraph';
import { VerifierTerminal } from '../credentials/VerifierTerminal';
import type { TerminalHandle } from '../credentials/VerifierTerminal';
import { Section } from './Section';

const categoryIcon: Record<CredentialCategory, IconType> = {
  ai: FiCpu,
  cloud: FiCloud,
  data: FiDatabase,
  dev: FiAward,
};

/** "Proof of competency": credentials, milestones, a verifier terminal, and GitHub activity. */
export function CredentialsSection() {
  const terminal = useRef<TerminalHandle>(null);
  const activity = useGitHubActivity(YEARS);

  const navigate = useNavigate();

  // Opens Contact with a verification request drafted, ready to send.
  const verify = (id: string) => {
    terminal.current?.run(`verify ${id}`);
    navigate('/#contact', { state: { contactDraft: verifyRequestMessage } });
  };

  return (
    <Section id="credentials" index={4} label="Credentials" title="Proof of competency.">
      <div className="proof">
        <ul className="proof-certs" aria-label="Certifications">
          {credentials.map((credential) => {
            const Icon = categoryIcon[credential.category];
            return (
              <li
                key={credential.id}
                className="credential-card cert-card"
                data-symbiote-target="card"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="credential-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="cert-year">{credential.issued}</span>
                </div>
                <h3 className="cert-title">{credential.title}</h3>
                <p className="cert-issuer">Issued by {credential.issuer}</p>
                <ul className="cert-focus" aria-label="Focus">
                  {credential.focus.map((item) => (
                    <li key={item} className="tag">
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="cert-verify"
                  data-symbiote-target
                  onClick={() => verify(credential.id)}
                >
                  Verify Credential <FiArrowUpRight aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="proof-milestones">
          <p className="eyebrow">Engineering milestones</p>
          <ul>
            {milestones.map((milestone, index) => (
              <li key={milestone.title} className="milestone" data-symbiote-target="card">
                <span className="milestone-index">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="milestone-title">{milestone.title}</h3>
                <p className="milestone-detail">{milestone.detail}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tools">
                  {milestone.tags.map((tag) => (
                    <li key={tag} className="tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div className="proof-live">
          <VerifierTerminal ref={terminal} activity={activity} />
          <ContributionGraph activity={activity} />
        </div>
      </div>
    </Section>
  );
}
