import type { IconType } from 'react-icons';
import { FiFileText, FiMail } from 'react-icons/fi';
import { accounts, site } from '../config/site';
import type { AccountId } from '../config/site';
import { isConfigured } from '../lib/placeholder';
import { icons } from '../lib/socialIcons';

// Dock order. Accounts still holding a [placeholder] URL are left out until they are filled in.
const order: AccountId[] = [
  'github',
  'linkedin',
  'leetcode',
  'huggingface',
  'kaggle',
  'x',
  'instagram',
  'email',
];

interface DockItem {
  key: string;
  label: string;
  href: string;
  icon: IconType;
  external: boolean;
}

/** A vertical glass dock on the left edge of wide screens. */
export function SocialDock() {
  const items: DockItem[] = order.flatMap((id) => {
    const account = accounts.find((entry) => entry.id === id);
    const ready = id === 'email' ? isConfigured(site.email) : isConfigured(account?.href);
    if (!account || !ready) return [];
    return [
      {
        key: id,
        label: id === 'email' ? site.email : account.label,
        href: account.href,
        icon: id === 'email' ? FiMail : icons[id],
        external: id !== 'email',
      },
    ];
  });
  if (site.resume.available) {
    items.push({
      key: 'resume',
      label: 'Resume',
      href: site.resume.href,
      icon: FiFileText,
      external: true,
    });
  }

  return (
    <nav className="social-dock" aria-label="Profiles">
      <ul>
        {items.map(({ key, label, href, icon: Icon, external }) => (
          <li key={key}>
            <a
              href={href}
              className="dock-link"
              data-symbiote-target
              aria-label={external ? `${label} (opens in a new tab)` : `Email ${label}`}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Icon size={17} aria-hidden="true" />
              <span className="dock-tip" aria-hidden="true">
                {label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
