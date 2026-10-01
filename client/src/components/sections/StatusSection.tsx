import { FiArrowUpRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { availability } from '../../config/content';
import { site } from '../../config/site';
import { Section } from './Section';

export function StatusSection() {
  return (
    <Section id="status" index={5} label="Status" title="Ready when you are.">
      <div className="status-panel" data-symbiote-target="card">
        <div className="status-live">
          <span className="hud-live" aria-hidden="true" />
          <div>
            <p className="status-key">Live status</p>
            <p className="mt-1.5 text-lg font-semibold text-ink sm:text-xl">
              {site.availableForWork ? availability.status : 'Not taking new work right now'}
            </p>
          </div>
        </div>
        <dl className="status-grid">
          <div>
            <dt className="status-key">Notice period</dt>
            <dd>{availability.notice}</dd>
          </div>
          <div>
            <dt className="status-key">Preferred location</dt>
            <dd>{availability.location}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="status-key">Preferred stack</dt>
            <dd>
              <ul className="mt-1 flex flex-wrap gap-2">
                {availability.stack.map((tech) => (
                  <li key={tech} className="tag">
                    {tech}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <Link to="/#contact" className="hero-cta hero-cta-primary mt-8 w-fit" data-symbiote-target>
          Start a conversation
          <FiArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </Section>
  );
}
