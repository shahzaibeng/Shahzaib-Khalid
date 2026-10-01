import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  /** Sections in the navbar carry its number, e.g. 01 // ARCHITECTURE. */
  index?: number;
  label: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, index, label, title, children }: SectionProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-heading`}
      className="content-section focus:outline-none"
    >
      <div className="section-heading">
        <p className="eyebrow section-index">
          {index !== undefined && (
            <>
              <span className="section-index-number">{String(index).padStart(2, '0')}</span>
              <span className="h-px w-6 bg-border" aria-hidden="true" />
            </>
          )}
          {label}
        </p>
        <h2 id={`${id}-heading`} className="section-title">
          {title}
        </h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
