import { about } from '../../config/content';
import { site } from '../../config/site';
import { isConfigured } from '../../lib/placeholder';
import { Section } from './Section';

export function AboutSection() {
  const paragraphs = [site.bio, ...about.paragraphs].filter(isConfigured);
  const facts = [
    { label: 'Role', value: site.title },
    { label: 'Based in', value: site.location },
    { label: 'Studied at', value: site.university },
    { label: 'Working at', value: site.company },
  ].filter(({ value }) => isConfigured(value));

  return (
    <Section id="about" index={1} label="Architecture" title="The person behind the code.">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5 text-base leading-8 text-muted sm:text-lg">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="space-y-8">
          <dl className="divide-y divide-border border-y border-border">
            {facts.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-6 py-4 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="eyebrow">Current focus</p>
            <ul className="mt-4 space-y-2 text-sm">
              {about.focus.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-highlight" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
