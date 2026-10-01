import { FiBookOpen, FiBriefcase } from 'react-icons/fi';
import { education, experience, skillGroups, yearsOfExperience } from '../../config/content';
import { Section } from './Section';

const allSkills = skillGroups.flatMap((group) => group.skills);

// Skills named in a role's highlights, shown as its stack.
function stackFor(highlights: readonly string[]) {
  const text = highlights.join(' ');
  return allSkills.filter(
    (skill, index) =>
      allSkills.indexOf(skill) === index &&
      new RegExp(`(^|[^\\w])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w]|$)`, 'i').test(
        text,
      ),
  );
}

export function ExperienceSection() {
  return (
    <Section
      id="experience"
      label="Experience"
      title={`${yearsOfExperience} years shipping AI and full stack products.`}
    >
      <ol className="timeline">
        {experience.map((role) => (
          <li key={`${role.company}-${role.start}`} className="timeline-item">
            <span className="timeline-marker" aria-hidden="true">
              <FiBriefcase />
            </span>
            <div className="timeline-card" data-symbiote-target="card">
              <header className="timeline-head">
                <div>
                  <h3 className="timeline-role">{role.title}</h3>
                  <p className="timeline-company">
                    {role.company} · {role.location}
                  </p>
                </div>
                <p className="timeline-dates">
                  {role.start} – {role.end}
                </p>
              </header>
              <ul className="timeline-highlights">
                {role.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack used">
                {stackFor(role.highlights).map((skill) => (
                  <li key={skill} className="tag">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
        {education.map((entry) => (
          <li key={entry.degree} className="timeline-item">
            <span className="timeline-marker" aria-hidden="true">
              <FiBookOpen />
            </span>
            <div className="timeline-card" data-symbiote-target="card">
              <header className="timeline-head">
                <div>
                  <h3 className="timeline-role">{entry.degree}</h3>
                  <p className="timeline-company">
                    {entry.school} · {entry.location}
                  </p>
                </div>
                <p className="timeline-dates">{entry.period}</p>
              </header>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
