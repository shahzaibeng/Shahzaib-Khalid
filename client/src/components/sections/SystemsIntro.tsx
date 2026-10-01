import { FiArrowDown } from 'react-icons/fi';

// The colony in the Mars backdrop, read as a system architecture.
const legend = [
  {
    code: 'PAD-00',
    name: 'Deploy',
    detail: 'Containerized with Docker, shipped through Git and GitHub.',
  },
  { code: 'HAB-01', name: 'Interface', detail: 'React and Tailwind CSS, wired to the APIs.' },
  {
    code: 'LAB-02',
    name: 'AI agents',
    detail: 'LLM agents with tool calling and structured outputs.',
  },
  { code: 'CORE-03', name: 'Services', detail: 'REST APIs in FastAPI, Node.js and .NET.' },
  { code: 'VAULT-04', name: 'Data', detail: 'PostgreSQL schemas and NoSQL stores.' },
  { code: 'UPLINK', name: 'Integrations', detail: 'LLM APIs and the data scrapers feeding them.' },
];

/** The opening screen of Systems: the colony stays in view while the legend explains it. */
export function SystemsIntro() {
  return (
    <section
      id="projects"
      tabIndex={-1}
      aria-labelledby="systems-intro-heading"
      className="systems-intro focus:outline-none"
    >
      <p className="eyebrow section-index">
        <span className="section-index-number">03</span>
        <span className="h-px w-6 bg-border" aria-hidden="true" />
        Systems · Mission control
      </p>
      <h2 id="systems-intro-heading" className="systems-intro-title">
        Every system is a colony of parts that have to work together.
      </h2>
      <p className="systems-intro-text">
        The base on the right is how I build: each structure is one layer of the stack, joined by
        pipelines that carry data, with an uplink to the models it depends on.
      </p>
      <dl className="systems-legend">
        {legend.map((item) => (
          <div key={item.code} className="systems-legend-row" data-symbiote-target="card">
            <dt>
              <span className="systems-legend-code">{item.code}</span>
              {item.name}
            </dt>
            <dd>{item.detail}</dd>
          </div>
        ))}
      </dl>
      {/* Scrolls within the overlay; changing the URL hash would close it. */}
      <button
        type="button"
        className="systems-scroll"
        data-symbiote-target
        onClick={() => {
          const list = document.getElementById('project-list');
          list?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          list?.focus({ preventScroll: true });
        }}
      >
        View projects <FiArrowDown aria-hidden="true" />
      </button>
    </section>
  );
}
