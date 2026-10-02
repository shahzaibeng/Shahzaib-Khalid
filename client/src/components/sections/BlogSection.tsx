import { FiArrowUpRight } from 'react-icons/fi';
import { posts } from '../../config/content';
import { Section } from './Section';

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' });

export function BlogSection() {
  return (
    <Section id="blog" label="Blog" title="Notes from the learning process.">
      {posts.length > 0 ? (
        <ul className="divide-y divide-border border-y border-border">
          {posts.map((post) => (
            <li key={post.href}>
              <a
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 py-6 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:gap-6"
              >
                <time dateTime={post.date} className="text-xs tabular-nums text-muted">
                  {dateFormat.format(new Date(post.date))}
                </time>
                <span>
                  <span className="font-display text-xl tracking-tight group-hover:text-primary">
                    {post.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted">{post.summary}</span>
                </span>
                <FiArrowUpRight className="hidden text-muted sm:block" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card">
          <p className="text-base leading-7 text-muted">
            The first articles are being written. They will cover lessons from building full stack
            and AI projects, including this portfolio.
          </p>
        </div>
      )}
    </Section>
  );
}
