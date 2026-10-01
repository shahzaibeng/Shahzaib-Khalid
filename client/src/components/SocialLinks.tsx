import { accounts } from '../config/site';
import { icons } from '../lib/socialIcons';

export function SocialLinks() {
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Find me online">
      {accounts.map((account) => {
        const Icon = icons[account.id];
        const configured = !account.href.includes('[') && !account.href.includes(']');
        return (
          <li key={account.id}>
            {configured ? (
              <a
                href={account.href}
                className="social-link"
                data-symbiote-target
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${account.label} (opens in a new tab)`}
                title={account.label}
              >
                <Icon size={18} aria-hidden="true" />
              </a>
            ) : (
              <span
                className="social-link cursor-default"
                role="img"
                aria-label={`${account.label} — coming soon`}
                title={`${account.label} — coming soon`}
              >
                <Icon size={18} aria-hidden="true" />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
