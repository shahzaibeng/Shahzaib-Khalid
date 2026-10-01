import { FiArrowUpRight, FiGithub } from 'react-icons/fi';
import { projects } from '../../config/content';
import { isConfigured } from '../../lib/placeholder';
import { Section } from './Section';

export function ProjectsSection() {
  return (
    <Section id="project-list" label="Projects" title="Ideas brought to life.">
      <ul className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <li key={project.title} className="card flex flex-col" data-symbiote-target="card">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl tracking-tight">{project.title}</h3>
              <span className="status-badge">{project.status}</span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-7 text-muted">{project.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
              {project.tags.map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
            {(isConfigured(project.repo) || isConfigured(project.live)) && (
              <div className="mt-6 flex flex-wrap gap-5 border-t border-border pt-4">
                {isConfigured(project.repo) && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                    aria-label={`${project.title} source code (opens in a new tab)`}
                  >
                    <FiGithub aria-hidden="true" /> Source
                  </a>
                )}
                {isConfigured(project.live) && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                    aria-label={`${project.title} live site (opens in a new tab)`}
                  >
                    Live site <FiArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
