import { FiArrowUpRight } from 'react-icons/fi';
import { site } from '../config/site';

export function ResumeLink() {
  const content = (
    <>
      <span>Resume</span>
      <FiArrowUpRight aria-hidden="true" size={16} />
    </>
  );
  if (!site.resume.available) {
    return (
      <span className="resume-link cursor-default" aria-disabled="true" title="Resume coming soon">
        {content}
        <span className="sr-only"> — coming soon</span>
      </span>
    );
  }
  return (
    <a
      className="resume-link"
      data-symbiote-target
      href={site.resume.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${site.name}’s resume in a new tab`}
    >
      {content}
    </a>
  );
}
