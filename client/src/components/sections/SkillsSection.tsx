import { skillGroups } from '../../config/content';
import { skillIcons } from '../../lib/skillIcons';
import { BlackHole } from '../skills/BlackHole';

/** Skills on a dark "event horizon" panel: the black hole pulls the logos into orbit. */
export function SkillsSection() {
  return (
    <section
      id="skills"
      tabIndex={-1}
      aria-labelledby="skills-heading"
      className="skills-universe night focus:outline-none"
    >
      <div className="skills-stars" aria-hidden="true" />
      <div className="skills-layout">
        <div className="skills-copy">
          <p className="eyebrow section-index">
            <span className="section-index-number">02</span>
            <span className="h-px w-6 bg-border" aria-hidden="true" />
            Skills
          </p>
          <h2 id="skills-heading" className="section-title">
            Everything I build with, in one orbit.
          </h2>
          <p className="skills-lede">
            From language models to the database underneath — the tools I use to take AI features
            from prototype to production.
          </p>
          <dl className="skills-groups">
            {skillGroups.map(({ title, skills }) => (
              <div key={title} className="skills-group" data-symbiote-target="card">
                <dt>{title}</dt>
                <dd>
                  <ul aria-label={`${title} skills`}>
                    {skills.map((skill) => {
                      const Icon = skillIcons[skill];
                      return (
                        <li key={skill} className="skill-chip">
                          {Icon && <Icon aria-hidden="true" />}
                          {skill}
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <BlackHole />
      </div>
    </section>
  );
}
